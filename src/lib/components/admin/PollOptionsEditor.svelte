<script lang="ts">
	let { initialOptions = [] }: { initialOptions?: string[] } = $props();

	let options = $state<string[]>(initialOptions.length > 0 ? [...initialOptions] : ['', '', '']);

	function addOption() {
		options.push('');
	}

	function removeOption(index: number) {
		options.splice(index, 1);
	}
</script>

<div>
	<p class="text-ink-soft text-sm font-medium">Flavour options</p>
	<p class="text-ink-soft/70 mt-1 text-xs">
		The choices customers pick from &mdash; e.g. Kinder, Twix, Oreo. Add as many as you like.
	</p>

	<div class="mt-3 grid gap-2 sm:grid-cols-2">
		{#each options as option, index (index)}
			<div class="flex items-center gap-2">
				<input
					name="optionName"
					placeholder={`Option ${index + 1}`}
					bind:value={options[index]}
					class="border-ink/15 focus:ring-pink/40 flex-1 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
				/>
				<button
					type="button"
					onclick={() => removeOption(index)}
					disabled={options.length === 1}
					class="text-ink-soft shrink-0 px-2 py-2 text-sm hover:text-red-600 disabled:opacity-30"
					aria-label="Remove option"
				>
					&times;
				</button>
			</div>
		{/each}
	</div>

	<button type="button" onclick={addOption} class="text-pink-deep mt-3 text-sm font-semibold hover:underline">
		+ Add option
	</button>
</div>
