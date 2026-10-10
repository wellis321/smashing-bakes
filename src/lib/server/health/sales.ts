import { and, count, desc, gte, lt, ne, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	bespokeOrderEnquiries,
	customers,
	newsletterSubscribers,
	orderItems,
	orders
} from '$lib/server/db/schema';

const DAY = 24 * 60 * 60 * 1000;

export type SalesReport = {
	periods: {
		label: string;
		now: number;
		before: number;
		money?: boolean;
	}[];
	weekly: { weekStart: string; revenue: number; orders: number }[];
	topProducts: { name: string; quantity: number; revenue: number }[];
	repeatRate: number | null;
	totals: { orders: number; revenue: number };
};

// Everything here comes straight from the orders already in the database, so it
// is always up to date. Cancelled orders are left out.
export async function getSalesReport(): Promise<SalesReport> {
	const now = new Date();
	const from30 = new Date(now.getTime() - 30 * DAY);
	const from60 = new Date(now.getTime() - 60 * DAY);
	const notCancelled = ne(orders.status, 'cancelled');

	const ordersBetween = async (from: Date, to: Date) => {
		const [row] = await db
			.select({ n: count(), revenue: sql<string>`coalesce(sum(${orders.totalPence}), 0)` })
			.from(orders)
			.where(and(notCancelled, gte(orders.createdAt, from), lt(orders.createdAt, to)));
		return { n: Number(row?.n ?? 0), revenue: Number(row?.revenue ?? 0) };
	};
	const rowsBetween = async (
		table: typeof customers | typeof newsletterSubscribers | typeof bespokeOrderEnquiries,
		col: any,
		from: Date,
		to: Date
	) => {
		const [row] = await db
			.select({ n: count() })
			.from(table)
			.where(and(gte(col, from), lt(col, to)));
		return Number(row?.n ?? 0);
	};

	const [cur, prev] = await Promise.all([
		ordersBetween(from30, now),
		ordersBetween(from60, from30)
	]);
	const [custNow, custPrev, subNow, subPrev, enqNow, enqPrev] = await Promise.all([
		rowsBetween(customers, customers.createdAt, from30, now),
		rowsBetween(customers, customers.createdAt, from60, from30),
		rowsBetween(newsletterSubscribers, newsletterSubscribers.subscribedAt, from30, now),
		rowsBetween(newsletterSubscribers, newsletterSubscribers.subscribedAt, from60, from30),
		rowsBetween(bespokeOrderEnquiries, bespokeOrderEnquiries.createdAt, from30, now),
		rowsBetween(bespokeOrderEnquiries, bespokeOrderEnquiries.createdAt, from60, from30)
	]);

	// Last 12 weeks, grouped by the Monday that starts each week.
	const weekStart = sql<string>`date(date_sub(${orders.createdAt}, interval weekday(${orders.createdAt}) day))`;
	const weeks = await db
		.select({
			weekStart,
			n: count(),
			revenue: sql<string>`coalesce(sum(${orders.totalPence}), 0)`
		})
		.from(orders)
		.where(and(notCancelled, gte(orders.createdAt, new Date(now.getTime() - 84 * DAY))))
		.groupBy(weekStart)
		.orderBy(weekStart);
	const byWeek = new Map(weeks.map((w) => [String(w.weekStart).slice(0, 10), w]));
	const weekly: SalesReport['weekly'] = [];
	const monday = new Date(now);
	monday.setUTCHours(0, 0, 0, 0);
	monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
	for (let i = 11; i >= 0; i--) {
		const d = new Date(monday.getTime() - i * 7 * DAY);
		const key = d.toISOString().slice(0, 10);
		const w = byWeek.get(key);
		weekly.push({ weekStart: key, revenue: Number(w?.revenue ?? 0), orders: Number(w?.n ?? 0) });
	}

	const top = await db
		.select({
			name: orderItems.productName,
			quantity: sql<string>`sum(${orderItems.quantity})`,
			revenue: sql<string>`sum(${orderItems.subtotalPence})`
		})
		.from(orderItems)
		.innerJoin(orders, sql`${orders.id} = ${orderItems.orderId}`)
		.where(and(notCancelled, gte(orders.createdAt, from30)))
		.groupBy(orderItems.productName)
		.orderBy(desc(sql`sum(${orderItems.subtotalPence})`))
		.limit(8);

	// Of the people who have ordered, how many ordered more than once?
	const perPerson = await db
		.select({ email: orders.guestEmail, n: count() })
		.from(orders)
		.where(notCancelled)
		.groupBy(orders.guestEmail);
	const repeatRate = perPerson.length
		? Math.round((perPerson.filter((p) => Number(p.n) > 1).length / perPerson.length) * 100)
		: null;

	const [all] = await db
		.select({ n: count(), revenue: sql<string>`coalesce(sum(${orders.totalPence}), 0)` })
		.from(orders)
		.where(notCancelled);

	return {
		periods: [
			{ label: 'Value of orders placed', now: cur.revenue, before: prev.revenue, money: true },
			{ label: 'Orders', now: cur.n, before: prev.n },
			{
				label: 'Average order value',
				now: cur.n ? Math.round(cur.revenue / cur.n) : 0,
				before: prev.n ? Math.round(prev.revenue / prev.n) : 0,
				money: true
			},
			{ label: 'New customer accounts', now: custNow, before: custPrev },
			{ label: 'Newsletter sign-ups', now: subNow, before: subPrev },
			{ label: 'Bespoke cake enquiries', now: enqNow, before: enqPrev }
		],
		weekly,
		topProducts: top.map((t) => ({
			name: t.name,
			quantity: Number(t.quantity),
			revenue: Number(t.revenue)
		})),
		repeatRate,
		totals: { orders: Number(all?.n ?? 0), revenue: Number(all?.revenue ?? 0) }
	};
}
