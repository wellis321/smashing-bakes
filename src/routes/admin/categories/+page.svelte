<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function confirmDelete(event: SubmitEvent, name: string) {
		if (!confirm(`Delete "${name}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Categories — Admin</title>
</svelte:head>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-2">
		<h1 class="font-display text-3xl text-ink">Categories</h1>
		<HelpLink section="categories" task="add-category" />
	</div>
	<a
		href="/admin/categories/new"
		class="rounded-full bg-pink px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep"
	>
		+ New category
	</a>
</div>
<p class="mt-2 max-w-lg text-sm text-ink-soft">
	Organise the shop into categories — used for browsing, filtering and reporting.
</p>
<div class="mt-3">
	<HelpLink
		section="categories"
		task="hide-category"
		label="Hide a category"
		title="How to hide a category"
	/>
</div>

{#if form?.message}
	<p class="mt-4 max-w-lg rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
{/if}

<div class="mt-6 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white/60">
	{#each data.categories as category (category.id)}
		<div class="flex items-center gap-4 px-4 py-3">
			<a href={`/admin/categories/${category.id}/edit`} class="min-w-0 flex-1">
				<p class="truncate text-sm font-medium text-ink">{category.name}</p>
				<p class="text-xs text-ink-soft">
					{category.productCount} product{category.productCount === 1 ? '' : 's'} &middot; /shop/{category.slug}
				</p>
				{#if category.isActive && category.visibleProductCount === 0}
					<p class="mt-0.5 text-xs font-semibold text-pink-deep">
						Hidden from the shop until it has a visible product
					</p>
				{/if}
			</a>

			<form method="POST" action="?/toggleActive" use:enhance>
				<input type="hidden" name="id" value={category.id} />
				<input type="hidden" name="nextValue" value={(!category.isActive).toString()} />
				<button
					type="submit"
					class={`rounded-full px-3 py-1 text-xs font-semibold ${
						category.isActive ? 'bg-ink/5 text-ink-soft' : 'bg-pink/10 text-pink-deep'
					}`}
				>
					{category.isActive ? 'Active' : 'Hidden'}
				</button>
			</form>

			<a href={`/admin/categories/${category.id}/edit`} class="text-sm text-ink-soft hover:text-ink"
				>Edit</a
			>

			<form
				method="POST"
				action="?/delete"
				use:enhance
				onsubmit={(e) => confirmDelete(e, category.name)}
			>
				<input type="hidden" name="id" value={category.id} />
				<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete</button>
			</form>
		</div>
	{/each}
</div>
