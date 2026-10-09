<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import type { CategorySummary } from '$lib/types';
	import MediaPicker from './MediaPicker.svelte';

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
		currentImageUrl,
		mediaItems = []
	}: {
		categories: CategorySummary[];
		values?: Values;
		currentImageUrl?: string | null;
		mediaItems?: { id: number; url: string; filename: string; altText: string | null }[];
	} = $props();
</script>

<div class="grid gap-6 sm:grid-cols-2">
	<div class="sm:col-span-2">
		<label for="name" class="text-sm font-medium text-ink-soft">Product name</label>
		<input
			id="name"
			name="name"
			required
			value={values.name ?? ''}
			class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
		/>
	</div>

	<div>
		<label for="slug" class="text-sm font-medium text-ink-soft">URL slug</label>
		<input
			id="slug"
			name="slug"
			placeholder="auto-generated from name if left blank"
			value={values.slug ?? ''}
			class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
		/>
	</div>

	<div>
		<label for="categoryId" class="text-sm font-medium text-ink-soft">Category</label>
		<select
			id="categoryId"
			name="categoryId"
			required
			class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
		>
			{#each categories as category (category.id)}
				<option value={category.id} selected={values.categoryId === category.id}
					>{category.name}</option
				>
			{/each}
		</select>
	</div>

	<div class="sm:col-span-2">
		<label for="description" class="text-sm font-medium text-ink-soft">Description</label>
		<textarea
			id="description"
			name="description"
			rows="3"
			class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			>{values.description ?? ''}</textarea
		>
	</div>

	<div>
		<label for="basePricePence" class="text-sm font-medium text-ink-soft">Price (£)</label>
		<input
			id="basePricePence"
			name="basePrice"
			type="number"
			min="0"
			step="0.01"
			required
			value={values.basePricePence != null ? (values.basePricePence / 100).toFixed(2) : ''}
			class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
		/>
	</div>

	<div>
		<label for="salePricePence" class="text-sm font-medium text-ink-soft"
			>Sale price (£, optional)</label
		>
		<span class="ml-2 align-middle"
			><HelpLink
				section="products"
				task="put-on-sale"
				label="How to put on sale"
				title="How to put a product on sale"
			/></span
		>
		<input
			id="salePricePence"
			name="salePrice"
			type="number"
			min="0"
			step="0.01"
			value={values.salePricePence != null ? (values.salePricePence / 100).toFixed(2) : ''}
			class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
		/>
	</div>

	<div>
		<label for="badge" class="text-sm font-medium text-ink-soft">Badge</label>
		<select
			id="badge"
			name="badge"
			class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
		>
			<option value="none" selected={values.badge === 'none' || !values.badge}>None</option>
			<option value="new" selected={values.badge === 'new'}>New bake</option>
			<option value="sale" selected={values.badge === 'sale'}>On sale</option>
		</select>
	</div>

	<div class="flex items-center gap-6">
		<label class="flex items-center gap-2 text-sm text-ink-soft">
			<input
				type="checkbox"
				name="isActive"
				value="true"
				checked={values.isActive ?? true}
				class="h-4 w-4 accent-pink"
			/>
			Visible on site
			<HelpLink
				section="products"
				task="hide-product"
				label="How to hide"
				title="How to hide a product without deleting it"
			/>
		</label>
		<label class="flex items-center gap-2 text-sm text-ink-soft">
			<input
				type="checkbox"
				name="isFeatured"
				value="true"
				checked={values.isFeatured ?? false}
				class="h-4 w-4 accent-pink"
			/>
			Feature on homepage
			<HelpLink
				section="products"
				task="this-weeks-bakes"
				label="How it works"
				title="How featuring works"
			/>
		</label>
	</div>

	<div class="sm:col-span-2">
		<MediaPicker
			items={mediaItems}
			fileFieldName="image"
			urlFieldName="imageUrl"
			currentUrl={currentImageUrl}
			label="Product photo"
			hint="JPG, PNG or WEBP, up to 5MB. Recommended: square, at least 1000×1000px. Leave blank to keep the current photo."
		/>
	</div>
</div>
