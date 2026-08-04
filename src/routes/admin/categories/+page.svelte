<script lang="ts">
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
	<h1 class="font-display text-3xl text-ink">Categories</h1>
	<a
		href="/admin/categories/new"
		class="bg-pink hover:bg-pink-deep rounded-full px-4 py-2 text-sm font-semibold text-cream transition-colors"
	>
		+ New category
	</a>
</div>
<p class="text-ink-soft mt-2 max-w-lg text-sm">
	Organise the shop into categories — used for browsing, filtering and reporting.
</p>

{#if form?.message}
	<p class="mt-4 max-w-lg rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
{/if}

<div class="border-ink/10 mt-6 divide-y divide-ink/10 rounded-xl border bg-white/60">
	{#each data.categories as category (category.id)}
		<div class="flex items-center gap-4 px-4 py-3">
			<a href={`/admin/categories/${category.id}/edit`} class="min-w-0 flex-1">
				<p class="text-ink truncate text-sm font-medium">{category.name}</p>
				<p class="text-ink-soft text-xs">
					{category.productCount} product{category.productCount === 1 ? '' : 's'} &middot; /shop/{category.slug}
				</p>
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

			<a href={`/admin/categories/${category.id}/edit`} class="text-ink-soft hover:text-ink text-sm">Edit</a>

			<form method="POST" action="?/delete" use:enhance onsubmit={(e) => confirmDelete(e, category.name)}>
				<input type="hidden" name="id" value={category.id} />
				<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete</button>
			</form>
		</div>
	{/each}
</div>
