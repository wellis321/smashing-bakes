/** Today's date as YYYY-MM-DD, server-local time. */
export function todayIso(): string {
	return new Date().toISOString().slice(0, 10);
}

/** The Monday of the current week, as YYYY-MM-DD, server-local time. */
export function weekStartIso(): string {
	const d = new Date();
	const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	const diffToMonday = day === 0 ? -6 : 1 - day;
	d.setDate(d.getDate() + diffToMonday);
	return d.toISOString().slice(0, 10);
}
