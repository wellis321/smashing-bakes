<script lang="ts">
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

<a href="/admin/newsletters" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Newsletters</a>
<h1 class="font-display mt-2 text-3xl text-ink">New newsletter</h1>

<div class="border-pink/20 bg-blush/40 mt-6 max-w-2xl rounded-2xl border p-5">
	<p class="text-ink text-sm font-semibold">What makes a bakery newsletter worth opening</p>
	<ul class="text-ink-soft mt-2 list-disc space-y-1 pl-5 text-sm">
		<li><strong class="text-ink">Be specific, not generic.</strong> "New flavour: Salted Caramel Brownies 🍫" gets opened; "This month's update" gets ignored.</li>
		<li><strong class="text-ink">Show, don't summarise.</strong> One real thing happening (a new bake, a sourcing story, a behind-the-scenes moment) beats a roundup of everything.</li>
		<li><strong class="text-ink">Ask something.</strong> A quick question ("Biscoff or Oreo next?") gets replies and comments — people like being asked.</li>
	</ul>
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
	<form
		method="POST"
		enctype="multipart/form-data"
		class="border-ink/10 rounded-2xl border bg-white/60 p-6"
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
				<label for="subject" class="text-ink-soft text-sm font-medium">Subject line</label>
				<input
					id="subject"
					name="subject"
					required
					bind:value={subject}
					placeholder="New flavour alert: Salted Caramel Brownies 🍫"
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				/>
			</div>

			<div>
				<label for="preheader" class="text-ink-soft text-sm font-medium">Preview text (optional)</label>
				<input
					id="preheader"
					name="preheader"
					bind:value={preheader}
					placeholder="Three batches deep testing this one — worth every crumb"
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				/>
				<p class="text-ink-soft/70 mt-1 text-xs">Shown next to the subject line in most inboxes.</p>
			</div>

			<MediaPicker
				items={data.mediaItems}
				fileFieldName="heroImageFile"
				urlFieldName="heroImageUrl"
				label="Hero image (optional)"
				bind:previewUrl={heroImageUrl}
			/>

			<div>
				<label for="heading" class="text-ink-soft text-sm font-medium">Heading</label>
				<input
					id="heading"
					name="heading"
					required
					bind:value={heading}
					placeholder="Meet our newest bake"
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				/>
			</div>

			<div>
				<label for="intro" class="text-ink-soft text-sm font-medium">Intro</label>
				<textarea
					id="intro"
					name="intro"
					rows="4"
					bind:value={intro}
					placeholder="We've been testing a new salted caramel brownie recipe all week (three batches deep — someone had to eat the rejects) and it's ready for its debut this weekend. Which one should we bring back next: Biscoff or Oreo?"
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				></textarea>
			</div>

			<NewsletterHighlightsEditor mediaItems={data.mediaItems} />

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="ctaLabel" class="text-ink-soft text-sm font-medium">Button text (optional)</label>
					<input
						id="ctaLabel"
						name="ctaLabel"
						bind:value={ctaLabel}
						placeholder="See this week's menu"
						class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
					/>
				</div>
				<div>
					<label for="ctaUrl" class="text-ink-soft text-sm font-medium">Button link (optional)</label>
					<input
						id="ctaUrl"
						name="ctaUrl"
						bind:value={ctaUrl}
						placeholder="/menus"
						class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
					/>
				</div>
			</div>

			<div>
				<label for="signOff" class="text-ink-soft text-sm font-medium">Sign-off (optional)</label>
				<input
					id="signOff"
					name="signOff"
					bind:value={signOff}
					placeholder="See you at the weekend — Alanah x"
					class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				/>
			</div>
		</div>

		<button
			type="submit"
			disabled={submitting}
			class="bg-pink hover:bg-pink-deep mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
		>
			{submitting ? 'Saving…' : 'Save draft'}
		</button>
	</form>

	<div class="lg:sticky lg:top-6">
		<p class="text-ink-soft text-xs font-semibold tracking-widest uppercase">Live preview</p>
		<div class="border-ink/10 mt-2 overflow-hidden rounded-2xl border bg-white/40 p-2">
			<iframe title="Newsletter preview" srcdoc={previewHtml} class="h-[720px] w-full rounded-xl border-0"></iframe>
		</div>
	</div>
</div>
