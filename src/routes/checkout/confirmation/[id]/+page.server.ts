import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { orders, orderItems } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(404, 'Order not found');

	const [order, items] = await Promise.all([
		db.query.orders.findFirst({ where: eq(orders.id, id) }),
		db.query.orderItems.findMany({ where: eq(orderItems.orderId, id) })
	]);

	if (!order) throw error(404, 'Order not found');

	return { order, items };
};
