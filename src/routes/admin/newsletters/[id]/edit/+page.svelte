<script lang="ts">
	import { enhance } from '$app/forms';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import NewsletterHighlightsEditor from '$lib/components/admin/NewsletterHighlightsEditor.svelte';
	import { renderNewsletterHtml } from '$lib/email/newsletter-template';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
	let scheduling = $state(false);
	let sendingTest = $state(false);
	let sendingNow = $state(false);

	const isSent = $derived(data.newsletter.status === 'sent');

	let subject = $state(data.newsletter.subject);
	let preheader = $state(data.newsletter.preheader ?? '');
	let heroImageUrl = $state<string | null>(data.newsletter.heroImageUrl);
	let heading = $state(data.newsletter.heading);
	let intro = $state(data.newsletter.intro ?? '');
	let ctaLabel = $state(data.newsletter.ctaLabel ?? '');
	let ctaUrl = $state(data.newsletter.ctaUrl ?? '');
	let signOff = $state(data.newsletter.signOff ?? '');
	let testEmail = $state(data.staffEmail);

	const initialHighlights = data.highlights.map((h) => ({
		imageUrl: h.imageUrl,
		title: h.title,
		description: h.description ?? '',
		linkUrl: h.linkUrl ?? ''
	}));

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
			initialHighlights,
			{ siteUrl: 'https://smashinbakes.com', unsubscribeUrl: '#' }
		)
	);

	function confirmSendNow(event: SubmitEvent) {
		if (!confirm(`Send "${subject}" to all ${data.audienceCount} subscribers now? This can't be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>{data.newsletter.subject} — Admin</title>
</svelte:head>

<a href="/admin/newsletters" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Newsletters</a>
<h1 class="font-display mt-2 text-3xl text-ink">{data.newsletter.subject}</h1>

{#if isSent}
	<div class="bg-blush mt-6 rounded-2xl p-6">
		<p class="text-ink text-sm font-medium">
			Sent {new Date(data.newsletter.sentAt ?? '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
			to {data.newsletter.recipientCount ?? 0} subscriber{data.newsletter.recipientCount === 1 ? '' : 's'}.
		</p>
		<p class="text-ink-soft mt-1 text-sm">Sent newsletters are kept as a record and can't be edited or re-sent.</p>
	</div>
{/if}

<div class="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
	<div class="space-y-6">
		{#if !isSent}
			<form
				method="POST"
				action="?/update"
				enctype="multipart/form-data"
				class="border-ink/10 rounded-2xl border bg-white/60 p-6"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update({ reset: false });
						submitting = false;
					};
				}}
			>
				{#if form?.message}
					<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
				{/if}
				{#if form?.success && !('sent' in form) && !('scheduled' in form) && !('testSentTo' in form)}
					<p class="bg-blush text-ink mb-4 rounded-lg px-3 py-2 text-sm">Saved.</p>
				{/if}

				<div class="space-y-4">
					<div>
						<label for="subject" class="text-ink-soft text-sm font-medium">Subject line</label>
						<input
							id="subject"
							name="subject"
							required
							bind:value={subject}
							class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
						/>
					</div>

					<div>
						<label for="preheader" class="text-ink-soft text-sm font-medium">Preview text (optional)</label>
						<input
							id="preheader"
							name="preheader"
							bind:value={preheader}
							class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
						/>
					</div>

					<MediaPicker
						items={data.mediaItems}
						fileFieldName="heroImageFile"
						urlFieldName="heroImageUrl"
						currentUrl={data.newsletter.heroImageUrl}
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
							class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
						></textarea>
					</div>

					<NewsletterHighlightsEditor {initialHighlights} mediaItems={data.mediaItems} />

					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for="ctaLabel" class="text-ink-soft text-sm font-medium">Button text (optional)</label>
							<input
								id="ctaLabel"
								name="ctaLabel"
								bind:value={ctaLabel}
								class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
							/>
						</div>
						<div>
							<label for="ctaUrl" class="text-ink-soft text-sm font-medium">Button link (optional)</label>
							<input
								id="ctaUrl"
								name="ctaUrl"
								bind:value={ctaUrl}
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
							class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={submitting}
					class="bg-pink hover:bg-pink-deep mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
				>
					{submitting ? 'Saving…' : 'Save changes'}
				</button>
			</form>

			{#if !data.emailConfigured}
				<div class="rounded-2xl border border-dashed border-ink/15 bg-white/40 p-6">
					<p class="text-ink text-sm font-medium">Email sending isn't connected yet</p>
					<p class="text-ink-soft mt-1 text-sm">
						Add <code class="text-xs">RESEND_API_KEY</code> and <code class="text-xs">RESEND_FROM_EMAIL</code> to the
						server environment to enable test sends and real sends. Everything else here still saves normally.
					</p>
				</div>
			{/if}

			<div class="border-ink/10 rounded-2xl border bg-white/60 p-6">
				<h2 class="text-ink text-lg font-semibold">Send a test</h2>
				<p class="text-ink-soft mt-1 text-sm">Sends the current saved version to one address so you can check it in a real inbox.</p>
				{#if form?.testSentTo}
					<p class="bg-blush text-ink mt-3 rounded-lg px-3 py-2 text-sm">Test sent to {form.testSentTo}.</p>
				{/if}
				<form
					method="POST"
					action="?/sendTest"
					class="mt-3 flex flex-wrap gap-2"
					use:enhance={() => {
						sendingTest = true;
						return async ({ update }) => {
							await update({ reset: false });
							sendingTest = false;
						};
					}}
				>
					<input
						type="email"
						name="testEmail"
						required
						bind:value={testEmail}
						placeholder="you@example.com"
						class="border-ink/15 focus:ring-pink/40 min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
					/>
					<button
						type="submit"
						disabled={sendingTest || !data.emailConfigured}
						class="text-ink shrink-0 rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold transition-colors hover:border-ink/30 disabled:opacity-50"
					>
						{sendingTest ? 'Sending…' : 'Send test'}
					</button>
				</form>
			</div>

			<div class="border-ink/10 rounded-2xl border bg-white/60 p-6">
				<h2 class="text-ink text-lg font-semibold">Schedule or send</h2>
				<p class="text-ink-soft mt-1 text-sm">
					Goes to all <strong>{data.audienceCount}</strong> current subscribers. Uses the last saved version — save your
					changes above first.
				</p>

				{#if data.newsletter.status === 'scheduled'}
					<p class="text-ink mt-3 text-sm">
						Scheduled for {new Date(data.newsletter.scheduledFor ?? '').toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.
					</p>
					<p class="text-ink-soft/70 mt-1 text-xs">
						Note: this date is a target, not yet automatic — come back and click "Send now" once it arrives, or connect
						a scheduled task to <code class="text-xs">/admin/newsletters/dispatch-scheduled</code>.
					</p>
					<form method="POST" action="?/unschedule" use:enhance class="mt-3">
						<button type="submit" class="text-ink-soft hover:text-ink text-sm underline">Cancel schedule</button>
					</form>
				{:else}
					<form
						method="POST"
						action="?/schedule"
						class="mt-3 flex flex-wrap items-end gap-2"
						use:enhance={() => {
							scheduling = true;
							return async ({ update }) => {
								await update({ reset: false });
								scheduling = false;
							};
						}}
					>
						<div>
							<label for="scheduledFor" class="text-ink-soft text-xs font-medium">Send date &amp; time</label>
							<input
								id="scheduledFor"
								name="scheduledFor"
								type="datetime-local"
								required
								class="border-ink/15 focus:ring-pink/40 mt-1 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
							/>
						</div>
						<button
							type="submit"
							disabled={scheduling}
							class="text-ink shrink-0 rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold transition-colors hover:border-ink/30 disabled:opacity-50"
						>
							{scheduling ? 'Scheduling…' : 'Schedule'}
						</button>
					</form>
				{/if}

				<form
					method="POST"
					action="?/sendNow"
					class="mt-4 border-t border-ink/10 pt-4"
					use:enhance={() => {
						sendingNow = true;
						return async ({ update }) => {
							await update({ reset: false });
							sendingNow = false;
						};
					}}
					onsubmit={confirmSendNow}
				>
					<button
						type="submit"
						disabled={sendingNow || !data.emailConfigured || data.audienceCount === 0}
						class="bg-pink hover:bg-pink-deep rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-50"
					>
						{sendingNow ? 'Sending…' : `Send now to ${data.audienceCount}`}
					</button>
				</form>
			</div>
		{/if}
	</div>

	<div class="lg:sticky lg:top-6">
		<p class="text-ink-soft text-xs font-semibold tracking-widest uppercase">Live preview</p>
		<div class="border-ink/10 mt-2 overflow-hidden rounded-2xl border bg-white/40 p-2">
			<iframe title="Newsletter preview" srcdoc={previewHtml} class="h-[720px] w-full rounded-xl border-0"></iframe>
		</div>
	</div>
</div>
