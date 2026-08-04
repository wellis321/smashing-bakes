<script lang="ts">
	import MenuSectionsEditor from './MenuSectionsEditor.svelte';

	type Values = {
		menuDate?: string;
		title?: string;
		openingHoursText?: string;
		noteText?: string;
		isPublished?: boolean;
	};

	let {
		values = {},
		initialSections = []
	}: {
		values?: Values;
		initialSections?: { title: string; itemsText: string }[];
	} = $props();
</script>

<div class="grid gap-6 sm:grid-cols-2">
	<div>
		<label for="menuDate" class="text-ink-soft text-sm font-medium">Weekend date</label>
		<input
			id="menuDate"
			name="menuDate"
			type="date"
			required
			value={values.menuDate ?? ''}
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
		<p class="text-ink-soft/70 mt-1 text-xs">Used to sort and file this under the right week.</p>
	</div>

	<div>
		<label for="openingHoursText" class="text-ink-soft text-sm font-medium">Opening hours</label>
		<input
			id="openingHoursText"
			name="openingHoursText"
			value={values.openingHoursText ?? ''}
			placeholder="Open Friday and Saturday 10am-4pm"
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div class="sm:col-span-2">
		<label for="title" class="text-ink-soft text-sm font-medium">Title (optional)</label>
		<input
			id="title"
			name="title"
			value={values.title ?? ''}
			placeholder="Menu for the weekend — leave blank to use the date"
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div class="sm:col-span-2">
		<label for="noteText" class="text-ink-soft text-sm font-medium">Note (optional)</label>
		<textarea
			id="noteText"
			name="noteText"
			rows="2"
			placeholder="Subject to change! Comment which cake you fancy trying this weekend!"
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			>{values.noteText ?? ''}</textarea
		>
	</div>

	<div class="sm:col-span-2">
		<MenuSectionsEditor {initialSections} />
	</div>

	<div>
		<label class="text-ink-soft flex items-center gap-2 text-sm">
			<input type="checkbox" name="isPublished" value="true" checked={values.isPublished ?? false} class="accent-pink h-4 w-4" />
			Published (visible on site)
		</label>
	</div>
</div>
