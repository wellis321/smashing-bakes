import type { PageServerLoad } from './$types';
import { getPublishedMenus } from '$lib/server/db/queries';

export const load: PageServerLoad = async () => {
	const todayIso = new Date().toISOString().slice(0, 10);
	const menus = await getPublishedMenus();

	// The soonest menu that hasn't happened yet — falls back to the most recent past
	// one once every published menu has expired, so the page is never empty up top.
	const upcoming = menus
		.filter((m) => m.menuDate >= todayIso)
		.sort((a, b) => a.menuDate.localeCompare(b.menuDate));
	const featuredMenu = upcoming[0] ?? menus[0] ?? null;

	return { menus, featuredMenu, todayIso };
};
