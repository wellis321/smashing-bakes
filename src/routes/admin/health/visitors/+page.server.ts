import type { PageServerLoad } from './$types';
import { getVisitorReport } from '$lib/server/analytics';

export const load: PageServerLoad = async () => {
	try {
		return { visitors: await getVisitorReport(), visitorsMissing: false };
	} catch {
		return { visitors: null, visitorsMissing: true };
	}
};
