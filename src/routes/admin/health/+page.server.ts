import type { PageServerLoad } from './$types';
import { buildReport } from '$lib/server/health/run';
import { loadHistory, loadTasks } from '$lib/server/health/load';
import { getSalesReport } from '$lib/server/health/sales';
import { getVisitorReport } from '$lib/server/analytics';

// A short summary of everything; each tab has the detail.
export const load: PageServerLoad = async () => {
	const { history, latest, tableMissing } = await loadHistory();
	const { tasks, tasksMissing } = await loadTasks();

	let visitors = null;
	try {
		visitors = await getVisitorReport();
	} catch {
		visitors = null;
	}
	let sales = null;
	try {
		sales = await getSalesReport();
	} catch {
		sales = null;
	}
	let report = '';
	try {
		report = tableMissing ? '' : await buildReport();
	} catch {
		report = '';
	}

	const open = tasks.filter((t) => t.status === 'open' || t.status === 'working');
	return {
		quickHistory: history['quick'] ?? [],
		quickLatest: latest['quick'] ?? null,
		lighthouseMobile: (history['lighthouse-mobile'] ?? []).slice(-1)[0] ?? null,
		lighthouseDesktop: (history['lighthouse-desktop'] ?? []).slice(-1)[0] ?? null,
		tableMissing,
		tasksMissing,
		openStaff: open.filter((t) => t.who === 'staff').length,
		openDeveloper: open.filter((t) => t.who !== 'staff').length,
		visitors,
		sales,
		report
	};
};
