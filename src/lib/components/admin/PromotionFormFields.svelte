<script lang="ts">
	import StepsEditor from './StepsEditor.svelte';

	type Values = {
		title?: string;
		slug?: string;
		tagline?: string;
		introText?: string;
		prizeDescription?: string;
		areaText?: string;
		deadlineText?: string;
		ctaLabel?: string;
		ctaUrl?: string;
		isPublished?: boolean;
		isFeaturedOnHomepage?: boolean;
		mechanic?: 'manual' | 'business_picker';
	};

	let {
		values = {},
		currentImageUrl,
		initialSteps = []
	}: {
		values?: Values;
		currentImageUrl?: string | null;
		initialSteps?: { label: string; description: string }[];
	} = $props();

	let mechanic = $state(values.mechanic ?? 'manual');
</script>

<div class="grid gap-6 sm:grid-cols-2">
	<div class="sm:col-span-2">
		<label for="title" class="text-ink-soft text-sm font-medium">Promotion title</label>
		<input
			id="title"
			name="title"
			required
			value={values.title ?? ''}
			placeholder="Supporting Local Businesses"
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div>
		<label for="slug" class="text-ink-soft text-sm font-medium">URL slug</label>
		<input
			id="slug"
			name="slug"
			placeholder="auto-generated from title if left blank"
			value={values.slug ?? ''}
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div>
		<label for="tagline" class="text-ink-soft text-sm font-medium">Tagline</label>
		<input
			id="tagline"
			name="tagline"
			value={values.tagline ?? ''}
			placeholder="Let's lift each other up!"
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div class="sm:col-span-2">
		<label for="introText" class="text-ink-soft text-sm font-medium">Intro text</label>
		<textarea
			id="introText"
			name="introText"
			rows="2"
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			>{values.introText ?? ''}</textarea
		>
	</div>

	<div class="sm:col-span-2">
		<label for="prizeDescription" class="text-ink-soft text-sm font-medium">Prize description</label>
		<textarea
			id="prizeDescription"
			name="prizeDescription"
			rows="2"
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			>{values.prizeDescription ?? ''}</textarea
		>
	</div>

	<div class="sm:col-span-2">
		<label for="mechanic" class="text-ink-soft text-sm font-medium">How people take part</label>
		<select
			id="mechanic"
			name="mechanic"
			bind:value={mechanic}
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 sm:w-auto"
		>
			<option value="manual">Steps (like/tag/share, entirely off-site)</option>
			<option value="business_picker">Choose a local business (on-site strip, resets weekly)</option>
		</select>
		<p class="text-ink-soft/70 mt-1 text-xs">
			Local business entries and winners are managed on the <a href="/admin/businesses" class="underline">Local businesses</a> page.
		</p>
	</div>

	{#if mechanic === 'manual'}
		<div class="sm:col-span-2">
			<StepsEditor {initialSteps} />
		</div>
	{/if}

	<div>
		<label for="areaText" class="text-ink-soft text-sm font-medium">Area</label>
		<input
			id="areaText"
			name="areaText"
			value={values.areaText ?? ''}
			placeholder="Barrhead and surrounding areas"
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div>
		<label for="deadlineText" class="text-ink-soft text-sm font-medium">Deadline / timing</label>
		<input
			id="deadlineText"
			name="deadlineText"
			value={values.deadlineText ?? ''}
			placeholder="Winner announced this Friday!"
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div>
		<label for="ctaLabel" class="text-ink-soft text-sm font-medium">Button text (optional)</label>
		<input
			id="ctaLabel"
			name="ctaLabel"
			value={values.ctaLabel ?? ''}
			placeholder="View the post on Instagram"
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div>
		<label for="ctaUrl" class="text-ink-soft text-sm font-medium">Button link (optional)</label>
		<input
			id="ctaUrl"
			name="ctaUrl"
			type="url"
			value={values.ctaUrl ?? ''}
			placeholder="https://instagram.com/..."
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div class="flex items-center gap-6">
		<label class="text-ink-soft flex items-center gap-2 text-sm">
			<input type="checkbox" name="isPublished" value="true" checked={values.isPublished ?? false} class="accent-pink h-4 w-4" />
			Published (visible on site)
		</label>
		<label class="text-ink-soft flex items-center gap-2 text-sm">
			<input type="checkbox" name="isFeaturedOnHomepage" value="true" checked={values.isFeaturedOnHomepage ?? false} class="accent-pink h-4 w-4" />
			Feature on homepage
		</label>
	</div>

	<div class="sm:col-span-2">
		<label for="heroImage" class="text-ink-soft text-sm font-medium">Hero photo</label>
		{#if currentImageUrl}
			<img src={currentImageUrl} alt="Current hero" class="bg-cream-dim mt-2 h-24 w-24 rounded-lg object-cover" />
		{/if}
		<input
			id="heroImage"
			name="heroImage"
			type="file"
			accept="image/jpeg,image/png,image/webp"
			class="text-ink-soft mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-ink/5 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink"
		/>
		<p class="text-ink-soft/70 mt-1 text-xs">
			JPG, PNG or WEBP, up to 5MB. Recommended: wide landscape (16:9), at least 1600&times;900px. Leave
			blank to keep the current photo.
		</p>
	</div>
</div>
