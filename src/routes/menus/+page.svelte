<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import MenuDisplay from '$lib/components/MenuDisplay.svelte';
	import ShopWindow from '$lib/components/shop/ShopWindow.svelte';
	import SignBoard from '$lib/components/shop/SignBoard.svelte';
	import PhotoFrame from '$lib/components/PhotoFrame.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const featuredEyebrow = $derived(
		data.featuredMenu && data.featuredMenu.menuDate >= data.todayIso
			? 'This weekend'
			: 'Most recent menu'
	);

	let search = $state('');
	let timeFilter = $state<'all' | 'upcoming' | 'past'>('all');

	function formatDate(dateStr: string) {
		return new Intl.DateTimeFormat('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(new Date(`${dateStr}T00:00:00`));
	}

	function previewNames(menu: (typeof data.menus)[number]) {
		return menu.sections.flatMap((s) => s.items.map((i) => i.name));
	}

	function allItemNames(menu: (typeof data.menus)[number]) {
		return menu.sections.flatMap((s) => s.items.map((i) => i.name));
	}

	function searchableText(menu: (typeof data.menus)[number]) {
		return [
			menu.title,
			menu.noteText,
			formatDate(menu.menuDate),
			...menu.sections.flatMap((s) => [s.title, ...s.items.map((i) => i.name)])
		]
			.filter(Boolean)
			.join(' ')
			.toLowerCase();
	}

	const filtered = $derived(
		data.menus.filter((menu) => {
			const matchesSearch =
				search.trim() === '' || searchableText(menu).includes(search.trim().toLowerCase());
			const matchesTime =
				timeFilter === 'all' ||
				(timeFilter === 'upcoming' && menu.menuDate >= data.todayIso) ||
				(timeFilter === 'past' && menu.menuDate < data.todayIso);
			return matchesSearch && matchesTime;
		})
	);
</script>

<SeoHead
	title="Weekly menus — Smashin' Bakes"
	description="See what's on the menu this weekend at Smashin' Bakes in Barrhead, with photos and prices, plus every past weekend's bakes."
/>

<ShopWindow openingHours={data.openingHours}>
	<header class="mx-auto max-w-2xl text-center">
		<SignBoard eyebrow="Every weekend's bakes" title="Weekly menus">
			{#snippet help()}
				{#if data.staff}
					<HelpLink
						section="weekly-menus"
						title="Staff only: how to manage weekly menus"
						task="edit-menu"
						label="Staff help"
						staff
					/>
				{/if}
			{/snippet}
		</SignBoard>
		<p class="mt-6 leading-relaxed text-ink-soft">
			See what&rsquo;s coming out of the oven for pickup this weekend &mdash; tap any bake to see it
			up close, or browse everything we&rsquo;ve made before.
		</p>
	</header>

	{#if data.featuredMenu}
		<div class="mt-10">
			<MenuDisplay
				menu={data.featuredMenu}
				eyebrow={featuredEyebrow}
				headingLevel="h2"
				viewHref={`/menus/${data.featuredMenu.menuDate}`}
			/>
		</div>
	{/if}

	<section class="mt-14" aria-labelledby="all-menus">
		<h2 id="all-menus" class="font-display text-3xl text-ink">Every menu so far</h2>
		<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
			<label for="menu-search" class="sr-only">Search past and upcoming menus</label>
			<input
				id="menu-search"
				type="search"
				bind:value={search}
				placeholder="Search a bake, e.g. &ldquo;Oreo&rdquo;&hellip;"
				class="w-full max-w-sm rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
			/>
			<div class="flex gap-2">
				{#each [{ id: 'all', label: 'All' }, { id: 'upcoming', label: 'Upcoming' }, { id: 'past', label: 'Past' }] as option (option.id)}
					<button
						type="button"
						onclick={() => (timeFilter = option.id as typeof timeFilter)}
						class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
							timeFilter === option.id
								? 'bg-ink text-cream'
								: 'border border-ink/10 text-ink-soft hover:border-ink/20 hover:text-ink'
						}`}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>

		{#if filtered.length === 0}
			<p class="py-16 text-center text-ink-soft">
				{data.menus.length === 0
					? 'No menus posted yet — check back soon.'
					: 'Nothing matches that search.'}
			</p>
		{:else}
			<ul class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each filtered as menu (menu.id)}
					{@const names = previewNames(menu)}
					<li>
						<a
							href={`/menus/${menu.menuDate}`}
							class="card group block h-full rounded-[1.5rem] border border-ink/10 bg-white/70 p-5 transition-all hover:-translate-y-1 hover:border-pink hover:bg-white"
						>
							<div class="flex items-center justify-between gap-3">
								<p class="text-sm font-semibold text-ink">{formatDate(menu.menuDate)}</p>
								{#if data.featuredMenu && menu.id === data.featuredMenu.id}
									<span
										class="rounded-full bg-pink-deep px-2.5 py-0.5 text-xs font-bold text-cream"
									>
										{menu.menuDate >= data.todayIso ? 'Current' : 'Latest'}
									</span>
								{/if}
							</div>

							{#if menu.thumbs.length > 0}
								<div class="mt-4 flex">
									{#each menu.thumbs as t, i (t.slug)}
										<div
											class="thumb h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-white bg-cream-dim shadow-soft {i >
											0
												? '-ml-4'
												: ''}"
										>
											<PhotoFrame
												src={t.imageUrl!}
												alt=""
												sizes="64px"
												widths={[160, 320]}
												defaultWidth={160}
												zoom={t.zoom}
												focal={t.focal}
												class="h-full w-full rounded-full"
											/>
										</div>
									{/each}
								</div>
							{/if}

							<p class="mt-4 text-sm leading-relaxed text-ink-soft">
								{names.slice(0, 5).join(', ')}{names.length > 5
									? ` + ${names.length - 5} more`
									: ''}
							</p>
							<p class="mt-3 text-sm font-semibold text-pink-deep group-hover:underline">
								See the menu &rarr;
							</p>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</ShopWindow>
