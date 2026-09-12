import { fail } from '@sveltejs/kit';
import { desc, eq, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { orders, orderItems } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const orderRows = await db.query.orders.findMany({ orderBy: [desc(orders.createdAt)] });
	if (orderRows.length === 0) return { orders: [] };

	const items = await db.query.orderItems.findMany({
		where: inArray(
			orderItems.orderId,
			orderRows.map((o) => o.id)
		)
	});
	const itemsByOrder = new Map<number, typeof items>();
	for (const item of items) {
		const list = itemsByOrder.get(item.orderId) ?? [];
		list.push(item);
		itemsByOrder.set(item.orderId, list);
	}

	return { orders: orderRows.map((o) => ({ ...o, items: itemsByOrder.get(o.id) ?? [] })) };
};

export const actions: Actions = {
	setStatus: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const status = String(formData.get('status') ?? '') as 'pending' | 'ready' | 'collected' | 'cancelled';
		if (!id || !['pending', 'ready', 'collected', 'cancelled'].includes(status)) {
			return fail(400, { message: 'Invalid request.' });
		}
		await db.update(orders).set({ status }).where(eq(orders.id, id));
		return { success: true };
	},

	setPaymentStatus: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const paymentStatus = String(formData.get('paymentStatus') ?? '') as 'unpaid' | 'paid';
		if (!id || !['unpaid', 'paid'].includes(paymentStatus)) {
			return fail(400, { message: 'Invalid request.' });
		}
		await db.update(orders).set({ paymentStatus }).where(eq(orders.id, id));
		return { success: true };
	}
};
