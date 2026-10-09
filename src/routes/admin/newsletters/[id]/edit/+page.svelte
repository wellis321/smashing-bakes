<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
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
		if (
			!confirm(
				`Send "${subject}" to all ${data.audienceCount} subscribers now? This can't be undone.`
			)
		) {
			event.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>{data.newsletter.subject} — Admin</title>
</svelte:head>

<a href="/admin/newsletters" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Newsletters</a
>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">{data.newsletter.subject}</h1>
	<HelpLink section="newsletters" task="send-newsletter" />
</div>

{#if isSent}
	<div class="mt-6 rounded-2xl bg-blush p-6">
		<p class="text-sm font-medium text-ink">
			Sent {new Date(data.newsletter.sentAt ?? '').toLocaleDateString('en-GB', {
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			})}
			to {data.newsletter.recipientCount ?? 0} subscriber{data.newsletter.recipientCount === 1
				? ''
				: 's'}.
		</p>
		<p class="mt-1 text-sm text-ink-soft">
			Sent newsletters are kept as a record and can't be edited or re-sent.
		</p>
	</div>
{/if}

<div class="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
	<div class="space-y-6">
		{#if !isSent}
			<form
				method="POST"
				action="?/update"
				enctype="multipart/form-data"
				class="rounded-2xl border border-ink/10 bg-white/60 p-6"
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
					<p class="mb-4 rounded-lg bg-blush px-3 py-2 text-sm text-ink">Saved.</p>
				{/if}

				<div class="space-y-4">
					<div>
						<label for="subject" class="text-sm font-medium text-ink-soft">Subject line</label>
						<input
							id="subject"
							name="subject"
							required
							bind:value={subject}
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
							class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
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
						<label for="heading" class="text-sm font-medium text-ink-soft">Heading</label>
						<input
							id="heading"
							name="heading"
							required
							bind:value={heading}
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
							class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
						></textarea>
					</div>

					<NewsletterHighlightsEditor {initialHighlights} mediaItems={data.mediaItems} />

					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for="ctaLabel" class="text-sm font-medium text-ink-soft"
								>Button text (optional)</label
							>
							<input
								id="ctaLabel"
								name="ctaLabel"
								bind:value={ctaLabel}
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
								class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
							/>
						</div>
					</div>

					<div>
						<label for="signOff" class="text-sm font-medium text-ink-soft"
							>Sign-off (optional)</label
						>
						<input
							id="signOff"
							name="signOff"
							bind:value={signOff}
							class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={submitting}
					class="mt-6 rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-60"
				>
					{submitting ? 'Saving…' : 'Save changes'}
				</button>
			</form>

			{#if !data.emailConfigured}
				<div class="rounded-2xl border border-dashed border-ink/15 bg-white/40 p-6">
					<p class="text-sm font-medium text-ink">Email sending isn't connected yet</p>
					<p class="mt-1 text-sm text-ink-soft">
						Add <code class="text-xs">RESEND_API_KEY</code> and
						<code class="text-xs">RESEND_FROM_EMAIL</code> to the server environment to enable test sends
						and real sends. Everything else here still saves normally.
					</p>
				</div>
			{/if}

			<div class="rounded-2xl border border-ink/10 bg-white/60 p-6">
				<h2 class="text-lg font-semibold text-ink">Send a test</h2>
				<p class="mt-1 text-sm text-ink-soft">
					Sends the current saved version to one address so you can check it in a real inbox.
				</p>
				{#if form?.testSentTo}
					<p class="mt-3 rounded-lg bg-blush px-3 py-2 text-sm text-ink">
						Test sent to {form.testSentTo}.
					</p>
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
						class="min-w-0 flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
					/>
					<button
						type="submit"
						disabled={sendingTest || !data.emailConfigured}
						class="shrink-0 rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/30 disabled:opacity-50"
					>
						{sendingTest ? 'Sending…' : 'Send test'}
					</button>
				</form>
			</div>

			<div class="rounded-2xl border border-ink/10 bg-white/60 p-6">
				<h2 class="text-lg font-semibold text-ink">Schedule or send</h2>
				<p class="mt-1 text-sm text-ink-soft">
					Goes to all <strong>{data.audienceCount}</strong> current subscribers. Uses the last saved version
					— save your changes above first.
				</p>

				{#if data.newsletter.status === 'scheduled'}
					<p class="mt-3 text-sm text-ink">
						Scheduled for {new Date(data.newsletter.scheduledFor ?? '').toLocaleString('en-GB', {
							dateStyle: 'medium',
							timeStyle: 'short'
						})}.
					</p>
					<p class="mt-1 text-xs text-ink-soft/70">
						Note: this date is a target, not yet automatic — come back and click "Send now" once it
						arrives, or connect a scheduled task to <code class="text-xs"
							>/admin/newsletters/dispatch-scheduled</code
						>.
					</p>
					<form method="POST" action="?/unschedule" use:enhance class="mt-3">
						<button type="submit" class="text-sm text-ink-soft underline hover:text-ink"
							>Cancel schedule</button
						>
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
							<label for="scheduledFor" class="text-xs font-medium text-ink-soft"
								>Send date &amp; time</label
							>
							<input
								id="scheduledFor"
								name="scheduledFor"
								type="datetime-local"
								required
								class="mt-1 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink/40"
							/>
						</div>
						<button
							type="submit"
							disabled={scheduling}
							class="shrink-0 rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/30 disabled:opacity-50"
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
						class="rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep disabled:opacity-50"
					>
						{sendingNow ? 'Sending…' : `Send now to ${data.audienceCount}`}
					</button>
				</form>
			</div>
		{/if}
	</div>

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
