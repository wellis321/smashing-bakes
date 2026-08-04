<script lang="ts">
	type Step = { label: string; description: string };

	let { initialSteps = [] }: { initialSteps?: Step[] } = $props();

	let steps = $state<Step[]>(
		initialSteps.length > 0 ? initialSteps.map((s) => ({ ...s })) : [{ label: '', description: '' }]
	);

	function addStep() {
		steps.push({ label: '', description: '' });
	}

	function removeStep(index: number) {
		steps.splice(index, 1);
	}
</script>

<div>
	<p class="text-ink-soft text-sm font-medium">How to enter (steps)</p>
	<p class="text-ink-soft/70 mt-1 text-xs">
		Shown as a row of steps, e.g. Like &middot; Tag &middot; Share. Add as many as you need.
	</p>

	<div class="mt-3 space-y-3">
		{#each steps as step, index (index)}
			<div class="flex items-start gap-2">
				<input
					name="stepLabel"
					placeholder="Label (e.g. Like)"
					bind:value={step.label}
					class="border-ink/15 focus:ring-pink/40 w-32 shrink-0 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
				/>
				<input
					name="stepDescription"
					placeholder="Description (e.g. this post)"
					bind:value={step.description}
					class="border-ink/15 focus:ring-pink/40 flex-1 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
				/>
				<button
					type="button"
					onclick={() => removeStep(index)}
					disabled={steps.length === 1}
					class="text-ink-soft shrink-0 px-2 py-2 text-sm hover:text-red-600 disabled:opacity-30"
					aria-label="Remove step"
				>
					&times;
				</button>
			</div>
		{/each}
	</div>

	<button
		type="button"
		onclick={addStep}
		class="text-pink-deep mt-3 text-sm font-semibold hover:underline"
	>
		+ Add step
	</button>
</div>
