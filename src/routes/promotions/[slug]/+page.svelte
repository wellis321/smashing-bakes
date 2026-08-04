<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const promo = $derived(data.promotion);

	let selectedId = $state<number | null>(null);
	let submitting = $state(false);

	const selectedBusiness = $derived(data.businesses?.find((b) => b.id === selectedId) ?? null);
	// A fixed animation-duration would speed up as more businesses are added (same
	// distance to travel, less time) — scale it with the list so the pace stays
	// constant regardless of how many are in the strip.
	const marqueeDuration = $derived(Math.max(20, (data.businesses?.length ?? 0) * 4));
	const chosenToday = $derived(
		form?.success
			? { businessId: form.chosenBusinessId, businessName: form.chosenBusinessName }
			: data.todaysChoice
	);

	const loginHref = `/account/login?redirectTo=${encodeURIComponent(page.url.pathname)}`;
	const registerHref = `/account/register?redirectTo=${encodeURIComponent(page.url.pathname)}`;
</script>

<svelte:head>
	<title>{promo.title} — Smashin&rsquo; Bakes</title>
	{#if promo.tagline}<meta name="description" content={promo.tagline} />{/if}
</svelte:head>

<section class="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
	<a href="/promotions" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Promotions</a>

	{#if promo.heroImageUrl}
		<div class="mt-6 overflow-hidden rounded-[2rem]">
			<img src={promo.heroImageUrl} alt={promo.title} class="aspect-[16/9] w-full object-cover" />
		</div>
	{/if}

	<div class="mx-auto mt-10 max-w-2xl text-center">
		<h1 class="font-display text-4xl text-ink sm:text-5xl">{promo.title}</h1>
		{#if promo.tagline}
			<p class="text-pink font-display mt-3 text-2xl italic">{promo.tagline}</p>
		{/if}
		{#if promo.introText}
			<p class="text-ink-soft mt-6 leading-relaxed">{promo.introText}</p>
		{/if}
	</div>

	{#if promo.prizeDescription}
		<div class="bg-blush mx-auto mt-10 max-w-xl rounded-2xl p-6 text-center">
			<p class="text-ink leading-relaxed">{promo.prizeDescription}</p>
		</div>
	{/if}

	{#if promo.mechanic === 'business_picker' && data.businesses}
		<div class="mt-14">
			{#if data.businesses.length === 0}
				<p class="text-ink-soft text-center text-sm">No businesses to choose from yet — check back soon.</p>
			{:else}
				<p class="text-ink-soft text-center text-sm">
					Tap a business below to choose it &mdash; one pick a day, entries reset every Monday.
					{#if page.data.customer && data.weekCount > 0}
						You&rsquo;ve picked {data.weekCount} day{data.weekCount === 1 ? '' : 's'} this week.
					{/if}
				</p>

				<p class="text-ink-soft/70 mt-2 text-center text-xs">Tap the highlighted business again to let it scroll on.</p>

				<div class="mt-3 overflow-hidden">
					<div
						class={`flex w-max gap-3 ${selectedId === null ? 'animate-marquee' : ''}`}
						style:animation-duration={`${marqueeDuration}s`}
					>
						{#each [...data.businesses, ...data.businesses] as business, i (i)}
							<button
								type="button"
								onclick={() => (selectedId = selectedId === business.id ? null : business.id)}
								class={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
									selectedId === business.id
										? 'bg-pink border-pink text-cream'
										: 'border-ink/10 bg-white text-ink hover:border-pink/40'
								}`}
							>
								{business.name}
							</button>
						{/each}
					</div>
				</div>

				{#if selectedBusiness}
					<div class="bg-blush mx-auto mt-5 max-w-md rounded-2xl p-5">
						<div class="flex items-start justify-between gap-3">
							<div>
								<p class="font-display text-ink text-xl">{selectedBusiness.name}</p>
								{#if selectedBusiness.category}
									<p class="text-ink-soft text-sm">{selectedBusiness.category}</p>
								{/if}
							</div>
							<button
								type="button"
								onclick={() => (selectedId = null)}
								aria-label="Close"
								class="text-ink-soft hover:text-ink shrink-0 text-lg leading-none"
							>
								&times;
							</button>
						</div>

						{#if selectedBusiness.description}
							<p class="text-ink-soft mt-3 text-sm leading-relaxed">{selectedBusiness.description}</p>
						{/if}

						{#if selectedBusiness.address || selectedBusiness.phone || selectedBusiness.website}
							<div class="text-ink-soft mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
								{#if selectedBusiness.address}
									<span class="inline-flex items-center gap-1.5">
										<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" aria-hidden="true">
											<path d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" />
											<circle cx="10" cy="8" r="2" />
										</svg>
										{selectedBusiness.address}
									</span>
								{/if}
								{#if selectedBusiness.phone}
									<a href={`tel:${selectedBusiness.phone}`} class="hover:text-ink inline-flex items-center gap-1.5">
										<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" aria-hidden="true">
											<path d="M5 3.5h2.5L9 7 7.5 8.5a8 8 0 004 4L13 11l3.5 1.5V15a1.5 1.5 0 01-1.5 1.5C8.5 16.5 3.5 11.5 3.5 5A1.5 1.5 0 015 3.5z" />
										</svg>
										{selectedBusiness.phone}
									</a>
								{/if}
								{#if selectedBusiness.website}
									<a href={selectedBusiness.website} target="_blank" rel="noreferrer" class="hover:text-ink inline-flex items-center gap-1.5">
										<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" aria-hidden="true">
											<path d="M8.5 11.5l3-3M8 7H6a3 3 0 000 6h2M12 7h2a3 3 0 010 6h-2" />
										</svg>
										Website
									</a>
								{/if}
							</div>
						{/if}

						{#if chosenToday}
							<p class="text-ink-soft mt-3 text-sm">
								{#if chosenToday.businessId === selectedBusiness.id}
									You&rsquo;ve chosen {selectedBusiness.name} today &mdash; thank you! Come back
									tomorrow for another entry.
								{:else}
									You&rsquo;ve already chosen {chosenToday.businessName} today &mdash; come back
									tomorrow to choose again.
								{/if}
							</p>
						{:else if !page.data.customer}
							<p class="text-ink-soft mt-3 text-sm">
								Log in to choose {selectedBusiness.name} and enter this week&rsquo;s draw.
							</p>
							<div class="mt-4 flex flex-wrap gap-3">
								<a
									href={loginHref}
									class="bg-pink hover:bg-pink-deep rounded-full px-5 py-2.5 text-sm font-semibold text-cream transition-colors"
								>
									Log in
								</a>
								<a
									href={registerHref}
									class="text-ink rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-ink/30"
								>
									Create an account
								</a>
							</div>
						{:else}
							<form
								method="POST"
								action="?/choose"
								class="mt-4"
								use:enhance={() => {
									submitting = true;
									return async ({ update }) => {
										await update();
										submitting = false;
									};
								}}
							>
								<input type="hidden" name="promotionId" value={promo.id} />
								<input type="hidden" name="businessId" value={selectedBusiness.id} />
								<button
									type="submit"
									disabled={submitting}
									class="bg-pink hover:bg-pink-deep w-full rounded-full py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
								>
									{submitting ? 'Choosing…' : `Choose ${selectedBusiness.name}`}
								</button>
							</form>
						{/if}

						{#if form?.message}
							<p class="mt-3 text-sm text-red-700">{form.message}</p>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	{:else if promo.steps.length > 0}
		<div class="mt-14 grid gap-8 sm:grid-cols-3">
			{#each promo.steps as step, index (step.id)}
				<div class="text-center">
					<div class="bg-pink/10 text-pink-deep font-display mx-auto grid h-14 w-14 place-items-center rounded-full text-xl italic">
						{index + 1}
					</div>
					<p class="text-ink mt-3 text-sm font-semibold uppercase tracking-wide">{step.label}</p>
					<p class="text-ink-soft mt-1 text-sm">{step.description}</p>
				</div>
			{/each}
		</div>
	{/if}

	{#if promo.ctaLabel && promo.ctaUrl}
		<div class="mt-12 text-center">
			<a
				href={promo.ctaUrl}
				target="_blank"
				rel="noreferrer"
				class="bg-pink hover:bg-pink-deep inline-flex rounded-full px-7 py-3.5 font-semibold text-cream shadow-soft transition-colors"
			>
				{promo.ctaLabel}
			</a>
		</div>
	{/if}
</section>

{#if promo.areaText || promo.deadlineText}
	<section class="bg-ink text-cream mt-16 py-8">
		<div class="mx-auto flex max-w-4xl flex-col items-center justify-center gap-3 px-5 text-center text-sm sm:flex-row sm:gap-10 sm:px-8">
			{#if promo.areaText}
				<p>{promo.areaText}</p>
			{/if}
			{#if promo.areaText && promo.deadlineText}
				<span class="hidden text-cream/30 sm:inline">&middot;</span>
			{/if}
			{#if promo.deadlineText}
				<p>{promo.deadlineText}</p>
			{/if}
		</div>
	</section>
{/if}

<style>
	@keyframes marquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.animate-marquee {
			animation: marquee 35s linear infinite;
		}
	}
</style>
