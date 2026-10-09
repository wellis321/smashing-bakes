<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import NewsletterHighlightsEditor from '$lib/components/admin/NewsletterHighlightsEditor.svelte';
	import { renderNewsletterHtml } from '$lib/email/newsletter-template';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);

	let subject = $state('');
	let preheader = $state('');
	let heroImageUrl = $state<string | null>(null);
	let heading = $state('');
	let intro = $state('');
	let ctaLabel = $state('');
	let ctaUrl = $state('');
	let signOff = $state('');

	const previewHtml = $derived(
		renderNewsletterHtml(
			{
				subject: subject || 'Your subject line',
				preheader: preheader || null,
				heroImageUrl,
				heading: heading || 'Your heading here',
				intro: intro || 'Your intro paragraph will appear here as you type.',
				ctaLabel: ctaLabel || null,
				ctaUrl: ctaUrl || null,
				signOff: signOff || null
			},
			[],
			{ siteUrl: 'https://smashinbakes.com', unsubscribeUrl: '#' }
		)
	);
</script>

<svelte:head>
	<title>New newsletter — Admin</title>
</svelte:head>

<a href="/admin/newsletters" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Newsletters</a
>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">New newsletter</h1>
	<HelpLink section="newsletters" task="send-newsletter" />
</div>

<div class="mt-6 rounded-2xl border border-pink/20 bg-blush/40 p-5">
	<p class="text-sm font-semibold text-ink">What makes a bakery newsletter worth opening</p>
	<ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
		<li>
			<strong class="text-ink">Be specific, not generic.</strong> "New flavour: Salted Caramel Brownies
			🍫" gets opened; "This month's update" gets ignored.
		</li>
		<li>
			<strong class="text-ink">Show, don't summarise.</strong> One real thing happening (a new bake, a
			sourcing story, a behind-the-scenes moment) beats a roundup of everything.
		</li>
		<li>
			<strong class="text-ink">Ask something.</strong> A quick question ("Biscoff or Oreo next?") gets
			replies and comments — people like being asked.
		</li>
	</ul>
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
	<form
		method="POST"
		enctype="multipart/form-data"
		class="rounded-2xl border border-ink/10 bg-white/60 p-6"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
	>
		{#if form?.message}
			<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
		{/if}

		<div class="space-y-4">
			<div>
				<label for="subject" class="text-sm font-medium text-ink-soft">Subject line</label>
				<input
					id="subject"
					name="subject"
					required
					bind:value={subject}
					placeholder="New flavour alert: Salted Caramel Brownies 🍫"
					class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				/>
			</div>

			<div>
				<label for="preheader" class="text-sm font-medium text-ink-soft"
					>Preview text (optional)</label
				>
				<input
					id="preheader"
					name="preheader"
					bind:value={preheader}
					placeholder="Three batches deep testing this one — worth every crumb"
					class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				/>
				<p class="mt-1 text-xs text-ink-soft/70">Shown next to the subject line in most inboxes.</p>
			</div>

			<MediaPicker
				items={data.mediaItems}
				fileFieldName="heroImageFile"
				urlFieldName="heroImageUrl"
				label="Hero image (optional)"
				bind:previewUrl={heroImageUrl}
			/>

			<div>
				<label for="heading" class="text-sm font-medium text-ink-soft">Heading</label>
				<input
					id="heading"
					name="heading"
					required
					bind:value={heading}
					placeholder="Meet our newest bake"
					class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				/>
			</div>

			<div>
				<label for="intro" class="text-sm font-medium text-ink-soft">Intro</label>
				<textarea
					id="intro"
					name="intro"
					rows="4"
					bind:value={intro}
					placeholder="We've been testing a new salted caramel brownie recipe all week (three batches deep — someone had to eat the rejects) and it's ready for its debut this weekend. Which one should we bring back next: Biscoff or Oreo?"
					class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				></textarea>
			</div>

			<NewsletterHighlightsEditor mediaItems={data.mediaItems} />

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="ctaLabel" class="text-sm font-medium text-ink-soft"
						>Button text (optional)</label
					>
					<input
						id="ctaLabel"
						name="ctaLabel"
						bind:value={ctaLabel}
						placeholder="See this week's menu"
						class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
					/>
				</div>
				<div>
					<label for="ctaUrl" class="text-sm font-medium text-ink-soft"
						>Button link (optional)</label
					>
					<input
						id="ctaUrl"
						name="ctaUrl"
						bind:value={ctaUrl}
						placeholder="/menus"
						class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
					/>
				</div>
			</div>

			<div>
				<label for="signOff" class="text-sm font-medium text-ink-soft">Sign-off (optional)</label>
				<input
					id="signOff"
					name="signOff"
					bind:value={signOff}
					placeholder="See you at the weekend — Alanah x"
					class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
				/>
			</div>
		</div>

		<button
			type="submit"
			disabled={submitting}
			class="mt-6 rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
		>
			{submitting ? 'Saving…' : 'Save draft'}
		</button>
	</form>

	<div class="lg:sticky lg:top-6">
		<p class="text-xs font-semibold tracking-widest text-ink-soft uppercase">Live preview</p>
		<div class="mt-2 overflow-hidden rounded-2xl border border-ink/10 bg-white/40 p-2">
			<iframe
				title="Newsletter preview"
				srcdoc={previewHtml}
				class="h-[720px] w-full rounded-xl border-0"
			></iframe>
		</div>
	</div>
</div>
