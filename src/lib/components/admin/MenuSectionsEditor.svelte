<script lang="ts">
	type Section = { title: string; itemsText: string };

	let { initialSections = [] }: { initialSections?: Section[] } = $props();

	let sections = $state<Section[]>(
		initialSections.length > 0 ? initialSections.map((s) => ({ ...s })) : [{ title: '', itemsText: '' }]
	);

	function addSection() {
		sections.push({ title: '', itemsText: '' });
	}

	function removeSection(index: number) {
		sections.splice(index, 1);
	}
</script>

<div>
	<p class="text-ink-soft text-sm font-medium">Menu sections</p>
	<p class="text-ink-soft/70 mt-1 text-xs">
		Group items the way you would on Instagram (e.g. "Brownies", "Blondies", "Cookie Pie"). One item per line.
	</p>

	<div class="mt-3 space-y-4">
		{#each sections as section, index (index)}
			<div class="border-ink/10 rounded-lg border bg-white p-3">
				<div class="flex items-start gap-2">
					<input
						name="sectionTitle"
						placeholder="Section title (e.g. Brownies)"
						bind:value={section.title}
						class="border-ink/15 focus:ring-pink/40 flex-1 rounded-lg border px-3 py-2 text-sm font-medium outline-none focus:ring-2"
					/>
					<button
						type="button"
						onclick={() => removeSection(index)}
						disabled={sections.length === 1}
						class="text-ink-soft shrink-0 px-2 py-2 text-sm hover:text-red-600 disabled:opacity-30"
						aria-label="Remove section"
					>
						&times;
					</button>
				</div>
				<textarea
					name="sectionItems"
					placeholder={'One item per line, e.g.\nOreo Brownies\nWispa Brownies\nCaramel Wafer Brownies'}
					rows="4"
					bind:value={section.itemsText}
					class="border-ink/15 focus:ring-pink/40 mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
				></textarea>
			</div>
		{/each}
	</div>

	<button type="button" onclick={addSection} class="text-pink-deep mt-3 text-sm font-semibold hover:underline">
		+ Add section
	</button>
</div>
