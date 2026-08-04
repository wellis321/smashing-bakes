<script lang="ts">
	import type { CategorySummary } from '$lib/types';

	type Values = {
		name?: string;
		slug?: string;
		description?: string;
		categoryId?: number;
		basePricePence?: number | null;
		salePricePence?: number | null;
		badge?: 'none' | 'sale' | 'new';
		isActive?: boolean;
		isFeatured?: boolean;
	};

	let {
		categories,
		values = {},
		currentImageUrl
	}: { categories: CategorySummary[]; values?: Values; currentImageUrl?: string | null } = $props();
</script>

<div class="grid gap-6 sm:grid-cols-2">
	<div class="sm:col-span-2">
		<label for="name" class="text-ink-soft text-sm font-medium">Product name</label>
		<input
			id="name"
			name="name"
			required
			value={values.name ?? ''}
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div>
		<label for="slug" class="text-ink-soft text-sm font-medium">URL slug</label>
		<input
			id="slug"
			name="slug"
			placeholder="auto-generated from name if left blank"
			value={values.slug ?? ''}
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div>
		<label for="categoryId" class="text-ink-soft text-sm font-medium">Category</label>
		<select
			id="categoryId"
			name="categoryId"
			required
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		>
			{#each categories as category (category.id)}
				<option value={category.id} selected={values.categoryId === category.id}>{category.name}</option>
			{/each}
		</select>
	</div>

	<div class="sm:col-span-2">
		<label for="description" class="text-ink-soft text-sm font-medium">Description</label>
		<textarea
			id="description"
			name="description"
			rows="3"
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
			>{values.description ?? ''}</textarea
		>
	</div>

	<div>
		<label for="basePricePence" class="text-ink-soft text-sm font-medium">Price (£)</label>
		<input
			id="basePricePence"
			name="basePrice"
			type="number"
			min="0"
			step="0.01"
			required
			value={values.basePricePence != null ? (values.basePricePence / 100).toFixed(2) : ''}
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div>
		<label for="salePricePence" class="text-ink-soft text-sm font-medium">Sale price (£, optional)</label>
		<input
			id="salePricePence"
			name="salePrice"
			type="number"
			min="0"
			step="0.01"
			value={values.salePricePence != null ? (values.salePricePence / 100).toFixed(2) : ''}
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
	</div>

	<div>
		<label for="badge" class="text-ink-soft text-sm font-medium">Badge</label>
		<select
			id="badge"
			name="badge"
			class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		>
			<option value="none" selected={values.badge === 'none' || !values.badge}>None</option>
			<option value="new" selected={values.badge === 'new'}>New bake</option>
			<option value="sale" selected={values.badge === 'sale'}>On sale</option>
		</select>
	</div>

	<div class="flex items-center gap-6">
		<label class="text-ink-soft flex items-center gap-2 text-sm">
			<input type="checkbox" name="isActive" value="true" checked={values.isActive ?? true} class="accent-pink h-4 w-4" />
			Visible on site
		</label>
		<label class="text-ink-soft flex items-center gap-2 text-sm">
			<input type="checkbox" name="isFeatured" value="true" checked={values.isFeatured ?? false} class="accent-pink h-4 w-4" />
			Feature on homepage
		</label>
	</div>

	<div class="sm:col-span-2">
		<label for="image" class="text-ink-soft text-sm font-medium">Product photo</label>
		{#if currentImageUrl}
			<img src={currentImageUrl} alt="Current product" class="bg-cream-dim mt-2 h-24 w-24 rounded-lg object-cover" />
		{/if}
		<input
			id="image"
			name="image"
			type="file"
			accept="image/jpeg,image/png,image/webp"
			class="text-ink-soft mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-ink/5 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink"
		/>
		<p class="text-ink-soft/70 mt-1 text-xs">
			JPG, PNG or WEBP, up to 5MB. Recommended: square, at least 1000&times;1000px. Leave blank to keep the current photo.
		</p>
	</div>
</div>
