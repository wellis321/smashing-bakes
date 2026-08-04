<script lang="ts">
	import MenuDisplay from '$lib/components/MenuDisplay.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const featuredEyebrow = $derived(
		data.featuredMenu && data.featuredMenu.menuDate >= data.todayIso ? 'This weekend' : 'Most recent menu'
	);

	let search = $state('');
	let timeFilter = $state<'all' | 'upcoming' | 'past'>('all');

	function formatDate(dateStr: string) {
		return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(
			new Date(`${dateStr}T00:00:00`)
		);
	}

	function allItemNames(menu: (typeof data.menus)[number]) {
		return menu.sections.flatMap((s) => s.items.map((i) => i.name));
	}

	function searchableText(menu: (typeof data.menus)[number]) {
		return [menu.title, menu.noteText, formatDate(menu.menuDate), ...menu.sections.flatMap((s) => [s.title, ...s.items.map((i) => i.name)])]
			.filter(Boolean)
			.join(' ')
			.toLowerCase();
	}

	const filtered = $derived(
		data.menus.filter((menu) => {
			const matchesSearch = search.trim() === '' || searchableText(menu).includes(search.trim().toLowerCase());
			const matchesTime =
				timeFilter === 'all' ||
				(timeFilter === 'upcoming' && menu.menuDate >= data.todayIso) ||
				(timeFilter === 'past' && menu.menuDate < data.todayIso);
			return matchesSearch && matchesTime;
		})
	);
</script>

<svelte:head>
	<title>Weekly menus — Smashin&rsquo; Bakes</title>
	<meta name="description" content="What's been on the menu each week at Smashin' Bakes — past and upcoming." />
</svelte:head>

<section class="mx-auto max-w-5xl px-5 pt-14 pb-8 sm:px-8">
	<p class="text-pink-deep text-sm font-semibold tracking-widest uppercase">Every weekend&rsquo;s bakes</p>
	<h1 class="font-display mt-2 text-4xl text-ink sm:text-5xl">Weekly menus</h1>
	<p class="text-ink-soft mt-4 max-w-lg leading-relaxed">
		What we&rsquo;ve had on for pickup, week by week &mdash; search for a favourite or browse what&rsquo;s
		coming up.
	</p>
</section>

{#if data.featuredMenu}
	<section class="mx-auto max-w-5xl px-5 pb-8 sm:px-8">
		<MenuDisplay menu={data.featuredMenu} eyebrow={featuredEyebrow} viewHref={`/menus/${data.featuredMenu.menuDate}`} />
	</section>
{/if}

<section class="mx-auto max-w-5xl px-5 pt-4 pb-8 sm:px-8">
	<h2 class="text-ink text-lg font-semibold">All menus</h2>
	<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
		<input
			type="search"
			bind:value={search}
			placeholder="Search a bake, e.g. &ldquo;Oreo&rdquo;&hellip;"
			class="border-ink/15 focus:ring-pink/40 w-full max-w-sm rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
		/>
		<div class="flex gap-2">
			{#each [{ id: 'all', label: 'All' }, { id: 'upcoming', label: 'Upcoming' }, { id: 'past', label: 'Past' }] as option (option.id)}
				<button
					type="button"
					onclick={() => (timeFilter = option.id as typeof timeFilter)}
					class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
						timeFilter === option.id ? 'bg-ink text-cream' : 'border border-ink/10 text-ink-soft hover:border-ink/20 hover:text-ink'
					}`}
				>
					{option.label}
				</button>
			{/each}
		</div>
	</div>
</section>

<section class="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
	{#if filtered.length === 0}
		<p class="text-ink-soft py-16 text-center">
			{data.menus.length === 0 ? 'No menus posted yet — check back soon.' : 'Nothing matches that search.'}
		</p>
	{:else}
		<div class="border-ink/10 overflow-hidden rounded-2xl border bg-white/60">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="border-ink/10 border-b text-xs font-semibold tracking-wide text-ink-soft uppercase">
						<th class="px-4 py-3 sm:px-6">Weekend</th>
						<th class="hidden px-4 py-3 sm:table-cell">What was on</th>
						<th class="px-4 py-3 text-right sm:px-6"></th>
					</tr>
				</thead>
				<tbody class="divide-ink/10 divide-y">
					{#each filtered as menu (menu.id)}
						{@const names = allItemNames(menu)}
						<tr class="hover:bg-cream-dim/60">
							<td class="px-4 py-4 align-top sm:px-6">
								<a href={`/menus/${menu.menuDate}`} class="text-ink font-medium hover:underline">
									{formatDate(menu.menuDate)}
								</a>
								{#if data.featuredMenu?.id === menu.id}
									<span class="bg-pink/15 text-pink-deep ml-2 rounded-full px-2 py-0.5 text-xs font-semibold uppercase">Current</span>
								{/if}
								{#if menu.title}<p class="text-ink-soft mt-0.5 text-xs">{menu.title}</p>{/if}
							</td>
							<td class="hidden px-4 py-4 align-top text-ink-soft sm:table-cell">
								{#if names.length > 0}
									{names.slice(0, 6).join(', ')}{#if names.length > 6}<span class="text-ink-soft/60"> +{names.length - 6} more</span>{/if}
								{:else}
									<span class="text-ink-soft/60">&mdash;</span>
								{/if}
							</td>
							<td class="px-4 py-4 text-right align-top sm:px-6">
								<a href={`/menus/${menu.menuDate}`} class="text-pink-deep text-sm font-semibold hover:underline">View &rarr;</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
