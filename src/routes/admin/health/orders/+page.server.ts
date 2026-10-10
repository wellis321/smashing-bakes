import type { PageServerLoad } from './$types';
import { getSalesReport } from '$lib/server/health/sales';

export const load: PageServerLoad = async () => {
	try {
		return { sales: await getSalesReport() };
	} catch (err) {
		console.error('[health] sales report failed', err);
		return { sales: null };
	}
};
