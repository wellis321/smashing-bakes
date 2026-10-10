<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(dateStr: string) {
		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(new Date(`${dateStr}T00:00:00`));
	}

	function itemCount(menu: (typeof data.menus)[number]) {
		return menu.sections.reduce((sum, s) => sum + s.items.length, 0);
	}

	function confirmDelete(event: SubmitEvent, label: string) {
		if (!confirm(`Delete the menu for ${label}? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Weekly menus — Admin</title>
</svelte:head>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-2">
		<h1 class="font-display text-3xl text-ink">Weekly menus</h1>
		<HelpLink section="weekly-menus" task="weekly-menu" />
	</div>
	<a
		href="/admin/menus/new"
		class="rounded-full bg-pink-deep px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker"
	>
		+ New menu
	</a>
</div>
<p class="mt-2 max-w-lg text-sm text-ink-soft">
	Post what's on for the weekend, just like on Instagram — grouped by section, with opening hours
	and a note. Publish one to add it to the <span class="font-medium text-ink">/menus</span> archive.
</p>

{#if data.menus.length === 0}
	<p class="mt-10 text-ink-soft">No weekly menus yet — create your first one.</p>
{:else}
	<div class="mt-6 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white/60">
		{#each data.menus as menu (menu.id)}
			<div class="flex items-center gap-4 px-4 py-3">
				<a href={`/admin/menus/${menu.id}/edit`} class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium text-ink">
						{menu.title || `Menu for ${formatDate(menu.menuDate)}`}
					</p>
					<p class="text-xs text-ink-soft">
						{formatDate(menu.menuDate)} &middot; {itemCount(menu)} items in {menu.sections.length} sections
					</p>
				</a>

				<form method="POST" action="?/togglePublished" use:enhance>
					<input type="hidden" name="id" value={menu.id} />
					<input type="hidden" name="nextValue" value={(!menu.isPublished).toString()} />
					<button
						type="submit"
						class={`rounded-full px-3 py-1 text-xs font-semibold ${
							menu.isPublished ? 'bg-ink/5 text-ink-soft' : 'bg-pink/10 text-pink-deep'
						}`}
					>
						{menu.isPublished ? 'Published' : 'Draft'}
					</button>
				</form>

				<a href={`/admin/menus/${menu.id}/edit`} class="text-sm text-ink-soft hover:text-ink"
					>Edit</a
				>

				<form
					method="POST"
					action="?/delete"
					use:enhance
					onsubmit={(e) => confirmDelete(e, formatDate(menu.menuDate))}
				>
					<input type="hidden" name="id" value={menu.id} />
					<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete</button>
				</form>
			</div>
		{/each}
	</div>
{/if}
