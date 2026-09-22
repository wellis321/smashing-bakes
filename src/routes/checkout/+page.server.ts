import { fail, redirect } from '@sveltejs/kit';
import { eq, inArray } from 'drizzle-orm';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { orders, orderItems, products, productVariants } from '$lib/server/db/schema';
import { isEmailConfigured, sendTestEmail } from '$lib/server/email/resend';
import { notifyOwnerOfOrder } from '$lib/server/email/owner-notifications';

type SubmittedItem = { productId: number; variantId: number | null; quantity: number };

function parseItems(raw: string): SubmittedItem[] | null {
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return null;
		return parsed
			.map((item) => ({
				productId: Number(item.productId),
				variantId: item.variantId == null ? null : Number(item.variantId),
				quantity: Math.max(1, Math.min(20, Number(item.quantity) || 0))
			}))
			.filter((item) => Number.isInteger(item.productId) && item.quantity > 0);
	} catch {
		return null;
	}
}

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const name = String(formData.get('name') ?? '').trim();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const phone = String(formData.get('phone') ?? '').trim() || null;
		const pickupDate = String(formData.get('pickupDate') ?? '').trim();
		const notes = String(formData.get('notes') ?? '').trim() || null;
		const fulfilmentMethod =
			formData.get('fulfilmentMethod') === 'delivery' ? 'delivery' : 'pickup';
		const deliveryAddress = String(formData.get('deliveryAddress') ?? '').trim() || null;
		const submittedItems = parseItems(String(formData.get('items') ?? ''));

		if (!name || !email || !pickupDate) {
			return fail(400, { message: 'Please fill in your name, email and a pickup day.' });
		}
		if (fulfilmentMethod === 'delivery' && !deliveryAddress) {
			return fail(400, { message: 'Please add a delivery address.' });
		}
		if (!submittedItems || submittedItems.length === 0) {
			return fail(400, { message: 'Your cart is empty.' });
		}

		// Prices and names are always taken from the database, never trusted from
		// the client — the cart is plain localStorage, so a submitted price could
		// easily have been tampered with in the browser before this request.
		const productIds = [...new Set(submittedItems.map((i) => i.productId))];
		const dbProducts = await db.query.products.findMany({
			where: inArray(products.id, productIds)
		});
		const productById = new Map(dbProducts.map((p) => [p.id, p]));

		const variantIds = submittedItems
			.map((i) => i.variantId)
			.filter((id): id is number => id != null);
		const dbVariants =
			variantIds.length > 0
				? await db.query.productVariants.findMany({
						where: inArray(productVariants.id, variantIds)
					})
				: [];
		const variantById = new Map(dbVariants.map((v) => [v.id, v]));

		const lineItems: {
			productId: number;
			variantId: number | null;
			productName: string;
			variantName: string | null;
			unitPricePence: number;
			quantity: number;
			subtotalPence: number;
		}[] = [];

		for (const item of submittedItems) {
			const product = productById.get(item.productId);
			if (!product || !product.isActive) {
				return fail(400, {
					message: `Sorry, one of the items in your cart is no longer available.`
				});
			}

			const variant = item.variantId != null ? variantById.get(item.variantId) : null;
			if (
				item.variantId != null &&
				(!variant || variant.productId !== product.id || !variant.isActive)
			) {
				return fail(400, {
					message: `Sorry, one of the options in your cart is no longer available.`
				});
			}

			const unitPricePence =
				variant?.priceOverridePence ??
				(product.badge === 'sale' && product.salePricePence != null
					? product.salePricePence
					: product.basePricePence);

			lineItems.push({
				productId: product.id,
				variantId: variant?.id ?? null,
				productName: product.name,
				variantName: variant?.name ?? null,
				unitPricePence,
				quantity: item.quantity,
				subtotalPence: unitPricePence * item.quantity
			});
		}

		const totalPence = lineItems.reduce((sum, i) => sum + i.subtotalPence, 0);

		const orderId = await db.transaction(async (tx) => {
			const [inserted] = await tx.insert(orders).values({
				guestName: name,
				guestEmail: email,
				guestPhone: phone,
				pickupDate,
				fulfilmentMethod,
				deliveryAddress: fulfilmentMethod === 'delivery' ? deliveryAddress : null,
				totalPence,
				notes
			});
			const newOrderId = inserted.insertId;

			await tx
				.insert(orderItems)
				.values(lineItems.map((item) => ({ ...item, orderId: newOrderId })));

			return newOrderId;
		});

		if (isEmailConfigured()) {
			try {
				const itemsList = lineItems
					.map(
						(i) => `${i.quantity}x ${i.productName}${i.variantName ? ` (${i.variantName})` : ''}`
					)
					.join('\n');
				const fulfilmentLine =
					fulfilmentMethod === 'delivery'
						? `<p>Thanks ${name}, we've got your order for free delivery on ${pickupDate} to:</p><p>${deliveryAddress}</p>`
						: `<p>Thanks ${name}, we've got your order for pickup on ${pickupDate}:</p>`;
				await sendTestEmail(
					email,
					`Order received — Smashin' Bakes`,
					`${fulfilmentLine}<pre>${itemsList}</pre><p>Total: £${(totalPence / 100).toFixed(2)}</p><p>Pay in person when you collect/receive it — online payment is coming soon.</p>`
				);
			} catch (err) {
				console.error('Failed to send order confirmation email:', err);
			}
		}

		await notifyOwnerOfOrder({
			id: orderId,
			guestName: name,
			guestEmail: email,
			totalPence,
			pickupDate,
			fulfilmentMethod,
			deliveryAddress: fulfilmentMethod === 'delivery' ? deliveryAddress : null
		});

		throw redirect(303, `/checkout/confirmation/${orderId}`);
	}
};
