export type PickupDateOption = { date: string; label: string };

// The next upcoming Friday and Saturday (in that order) — pickup is never
// "today," even if today is itself a Friday or Saturday, since orders need
// at least a little lead time to bake for.
export function getNextPickupDates(from: Date = new Date()): PickupDateOption[] {
	const options: PickupDateOption[] = [];
	const base = new Date(from);
	base.setHours(0, 0, 0, 0);

	for (let offset = 1; offset <= 8 && options.length < 2; offset++) {
		const d = new Date(base);
		d.setDate(d.getDate() + offset);
		if (d.getDay() === 5 || d.getDay() === 6) {
			options.push({
				date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
				label: new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
			});
		}
	}

	return options;
}
