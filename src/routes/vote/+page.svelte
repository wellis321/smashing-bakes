<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);

	const MAX_SELECTIONS = 3;

	// Persist picks across the login/register round-trip (sessionStorage isn't
	// available during SSR, hence the typeof guard) so logging in doesn't waste
	// the choices someone already made.
	const picksStorageKey = $derived(data.poll ? `vote-picks-${data.poll.id}` : null);
	function loadSavedSelections(): Set<number> {
		if (!picksStorageKey || typeof sessionStorage === 'undefined') return new Set();
		try {
			const saved = sessionStorage.getItem(picksStorageKey);
			return saved ? new Set(JSON.parse(saved)) : new Set();
		} catch {
			return new Set();
		}
	}

	let selected = $state<Set<number>>(loadSavedSelections());
	let stage = $state<'select' | 'confirm'>('select');

	$effect(() => {
		if (!picksStorageKey || typeof sessionStorage === 'undefined') return;
		if (data.myVote || form?.success || selected.size === 0) {
			sessionStorage.removeItem(picksStorageKey);
		} else {
			sessionStorage.setItem(picksStorageKey, JSON.stringify([...selected]));
		}
	});

	function toggle(optionId: number, checked: boolean) {
		if (checked && selected.size >= MAX_SELECTIONS) return;
		const next = new Set(selected);
		if (checked) next.add(optionId);
		else next.delete(optionId);
		selected = next;
	}

	function selectedOptionNames(poll: { options: { id: number; name: string }[] }) {
		return poll.options.filter((o) => selected.has(o.id)).map((o) => o.name);
	}

	const loginHref = `/account/login?redirectTo=${encodeURIComponent(page.url.pathname)}`;
	const registerHref = `/account/register?redirectTo=${encodeURIComponent(page.url.pathname)}`;

	const maxResultCount = $derived(
		data.results ? Math.max(1, ...data.results.map((r) => r.count)) : 1
	);
	function resultCount(optionId: number) {
		return data.results?.find((r) => r.optionId === optionId)?.count ?? 0;
	}
</script>

<SeoHead
	title="Vote — Smashin' Bakes"
	description="Vote for your favourite flavours and be entered into this week's prize draw."
/>

<section class="mx-auto max-w-5xl px-5 pt-14 pb-24 sm:px-8">
	<p class="text-sm font-semibold tracking-widest text-pink-deep uppercase">Have your say</p>
	<div class="flex items-center gap-2">
		<h1 class="mt-2 font-display text-4xl text-ink sm:text-5xl">
			Vote for next week&rsquo;s flavours
		</h1>
		{#if data.staff}
			<HelpLink
				section="polls"
				title="Staff only: how to manage polls"
				task="flavour-poll"
				label="Staff help"
				staff
			/>
		{/if}
	</div>

	{#if !data.poll}
		<p class="mt-6 leading-relaxed text-ink-soft">
			No poll running right now &mdash; check back soon, or see what&rsquo;s currently on the
			<a href="/menus" class="font-semibold text-pink-deep hover:underline">weekly menu</a>.
		</p>
	{:else}
		<div class="mt-8 rounded-[2rem] bg-blush p-6 sm:p-8">
			<h2 class="font-display text-2xl text-ink">{data.poll.title}</h2>
			{#if data.poll.description}
				<p class="mt-2 leading-relaxed text-ink-soft">{data.poll.description}</p>
			{/if}
			<div class="mt-3 flex flex-wrap gap-2 text-sm">
				{#if data.poll.prizeDescription}
					<span
						class="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-ink-soft"
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 20 20"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<rect x="3" y="8" width="14" height="9" rx="1" />
							<path d="M3 8h14M10 8v9" />
							<path d="M10 8c-1.5-3-5-3-5-.5C5 8 7 8 10 8zM10 8c1.5-3 5-3 5-.5C15 8 13 8 10 8z" />
						</svg>
						{data.poll.prizeDescription}
					</span>
				{/if}
				{#if data.poll.deadlineText}
					<span
						class="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-ink-soft"
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 20 20"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<circle cx="10" cy="10" r="7.5" />
							<path d="M10 5.5V10l3 2" />
						</svg>
						{data.poll.deadlineText}
					</span>
				{/if}
			</div>

			<p class="mt-4 inline-flex items-start gap-1.5 text-xs text-ink-soft">
				<svg
					width="13"
					height="13"
					viewBox="0 0 20 20"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="mt-0.5 shrink-0"
					aria-hidden="true"
				>
					<circle cx="10" cy="10" r="7.5" />
					<path d="M10 6.5v4M10 13.2v.1" />
				</svg>
				One vote per person &mdash; once you submit, your picks are final and can&rsquo;t be changed.
			</p>

			{#if data.myVote || form?.success}
				<div class="mt-6 flex items-start gap-3 rounded-2xl bg-white/70 p-5">
					<svg
						width="22"
						height="22"
						viewBox="0 0 20 20"
						fill="none"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="mt-0.5 shrink-0 text-pink-deep"
						aria-hidden="true"
					>
						<circle cx="10" cy="10" r="7.5" />
						<path d="M6.5 10.5l2.5 2.5 4.5-5.5" />
					</svg>
					<div>
						<p class="font-display text-xl text-ink">You&rsquo;re in!</p>
						<p class="mt-1 text-sm text-ink-soft">
							Thanks for voting — good luck in the prize draw.
						</p>
					</div>
				</div>

				{#if data.results}
					<div class="mt-6 space-y-3">
						{#each data.poll.options as option (option.id)}
							<div>
								<div class="flex items-center justify-between text-sm">
									<span class="font-medium text-ink">{option.name}</span>
									<span class="text-ink-soft">{resultCount(option.id)}</span>
								</div>
								<div class="mt-1 h-2 overflow-hidden rounded-full bg-white/60">
									<div
										class="h-full rounded-full bg-pink"
										style:width={`${(resultCount(option.id) / maxResultCount) * 100}%`}
									></div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{:else if stage === 'select'}
				<div class="mt-6">
					<p class="text-sm text-ink-soft">
						Pick up to {MAX_SELECTIONS} &mdash; {selected.size}/{MAX_SELECTIONS} selected
					</p>

					<div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
						{#each data.poll.options as option (option.id)}
							{@const isChecked = selected.has(option.id)}
							{@const isDisabled = !isChecked && selected.size >= MAX_SELECTIONS}
							<label
								class={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-center text-sm font-medium transition-colors ${
									isChecked
										? 'border-pink bg-pink text-cream'
										: isDisabled
											? 'cursor-not-allowed border-ink/10 bg-white/40 text-ink-soft/40'
											: 'border-ink/10 bg-white/70 text-ink hover:border-pink/40'
								}`}
							>
								<input
									type="checkbox"
									checked={isChecked}
									disabled={isDisabled}
									class="sr-only"
									onchange={(e) => toggle(option.id, e.currentTarget.checked)}
								/>
								{option.name}
							</label>
						{/each}
					</div>

					{#if page.data.customer}
						<button
							type="button"
							disabled={selected.size === 0}
							onclick={() => (stage = 'confirm')}
							class="mt-6 w-full rounded-full bg-pink py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
						>
							Review my picks
						</button>
					{:else}
						<div class="mt-6 rounded-2xl bg-white/70 p-5">
							<p class="text-sm font-medium text-ink">
								{selected.size > 0
									? `Log in to submit your ${selected.size === 1 ? 'pick' : 'picks'}`
									: 'Log in to vote'}
							</p>
							<p class="mt-1 text-sm text-ink-soft">
								Voting is open to logged-in customers, so we can enter you into the prize draw
								{selected.size > 0 ? ' — your picks will still be here when you get back.' : '.'}
							</p>
							<div class="mt-4 flex flex-wrap gap-3">
								<a
									href={loginHref}
									class="rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep"
								>
									Log in
								</a>
								<a
									href={registerHref}
									class="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
								>
									Create an account
								</a>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<form
					method="POST"
					action="?/vote"
					class="mt-6"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							await update();
							submitting = false;
						};
					}}
				>
					{#each selected as optionId (optionId)}
						<input type="hidden" name="optionId" value={optionId} />
					{/each}

					{#if form?.message}
						<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
					{/if}

					<div class="rounded-2xl bg-white/70 p-5">
						<p class="text-sm font-medium text-ink">Confirm your vote</p>
						<p class="mt-1 text-sm text-ink-soft">You&rsquo;re about to vote for:</p>
						<ul class="mt-3 flex flex-wrap gap-2">
							{#each selectedOptionNames(data.poll) as name (name)}
								<li class="rounded-full bg-pink/15 px-3 py-1 text-sm font-medium text-pink-deep">
									{name}
								</li>
							{/each}
						</ul>
						<p class="mt-3 text-xs text-ink-soft/70">
							Votes can&rsquo;t be changed once submitted.
						</p>
					</div>

					<div class="mt-4 flex gap-3">
						<button
							type="button"
							onclick={() => (stage = 'select')}
							class="flex-1 rounded-full border border-ink/15 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
						>
							&larr; Change my picks
						</button>
						<button
							type="submit"
							disabled={submitting}
							class="flex-1 rounded-full bg-pink py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
						>
							{submitting ? 'Submitting…' : 'Confirm & submit'}
						</button>
					</div>
				</form>
			{/if}
		</div>
	{/if}
</section>
