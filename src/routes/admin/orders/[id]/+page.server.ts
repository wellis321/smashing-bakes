import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { orders, orderItems } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const [order, items] = await Promise.all([
		db.query.orders.findFirst({ where: eq(orders.id, id) }),
		db.query.orderItems.findMany({ where: eq(orderItems.orderId, id) })
	]);
	if (!order) throw error(404, 'Order not found');

	return { order, items };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();
		const status = String(formData.get('status') ?? '') as 'pending' | 'ready' | 'collected' | 'cancelled';
		const paymentStatus = String(formData.get('paymentStatus') ?? '') as 'unpaid' | 'paid';

		if (!['pending', 'ready', 'collected', 'cancelled'].includes(status) || !['unpaid', 'paid'].includes(paymentStatus)) {
			return fail(400, { message: 'Invalid request.' });
		}

		await db.update(orders).set({ status, paymentStatus }).where(eq(orders.id, id));
		return { success: true };
	},

	delete: async ({ params }) => {
		const id = Number(params.id);
		await db.delete(orderItems).where(eq(orderItems.orderId, id));
		await db.delete(orders).where(eq(orders.id, id));
		throw redirect(303, '/admin/orders');
	}
};
