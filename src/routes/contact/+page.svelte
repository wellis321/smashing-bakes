<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);

	const address = '9-11 Paisley Road, Barrhead, G78 1HG';
	const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
	const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
</script>

<svelte:head>
	<title>Contact — Smashin&rsquo; Bakes</title>
	<meta name="description" content="Get in touch with Smashin' Bakes in Barrhead — bespoke cake enquiries, address, opening hours and how to pre-order." />
</svelte:head>

<section class="mx-auto max-w-5xl px-5 pt-14 pb-8 sm:px-8">
	<p class="text-pink-deep text-sm font-semibold tracking-widest uppercase">Get in touch</p>
	<h1 class="font-display mt-2 text-4xl text-ink sm:text-5xl">Looking for something different?</h1>
	<p class="text-ink-soft mt-4 max-w-xl leading-relaxed">
		Our Smashin&rsquo; baker Alanah can come up with something amazing for your extra special
		occasion. Just get in touch and we&rsquo;ll see what we can do for you.
	</p>
</section>

<section class="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
	<div class="grid gap-8 lg:grid-cols-2 lg:items-start">
		<!-- Bespoke order form -->
		<div class="bg-blush rounded-[2rem] p-6 sm:p-8">
			<p class="font-display text-2xl text-ink">Bespoke order</p>
			<p class="text-ink-soft mt-3 text-sm leading-relaxed">
				Whether it&rsquo;s a Smashin&rsquo; old-school cake or a themed birthday cake, we can get
				you sorted. Fill in the form and we&rsquo;ll be in touch &mdash; if you&rsquo;re not sure
				exactly what you want yet, just leave us your details and we&rsquo;ll help you figure it
				out.
			</p>

			{#if form?.success}
				<div class="mt-6 rounded-xl bg-white/70 px-5 py-6 text-center">
					<p class="font-display text-xl text-ink">Thanks &mdash; got it!</p>
					<p class="text-ink-soft mt-2 text-sm">We&rsquo;ll be in touch soon to talk through your order.</p>
				</div>
			{:else}
				<form
					method="POST"
					class="mt-6 space-y-4"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							await update();
							submitting = false;
						};
					}}
				>
					<!-- Honeypot — left blank by real visitors, hidden from view and the tab order. -->
					<div class="absolute -left-[9999px]" aria-hidden="true">
						<label for="company">Company</label>
						<input type="text" id="company" name="company" tabindex="-1" autocomplete="off" />
					</div>

					{#if form?.message}
						<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
					{/if}

					<div>
						<label for="name" class="text-ink-soft text-sm font-medium">Name</label>
						<input
							id="name"
							name="name"
							required
							value={form?.values?.name ?? ''}
							class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
						/>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for="email" class="text-ink-soft text-sm font-medium">Email</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								value={form?.values?.email ?? ''}
								class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
							/>
						</div>
						<div>
							<label for="phone" class="text-ink-soft text-sm font-medium">Phone (optional)</label>
							<input
								id="phone"
								name="phone"
								type="tel"
								value={form?.values?.phone ?? ''}
								class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
							/>
						</div>
					</div>

					<div>
						<label for="details" class="text-ink-soft text-sm font-medium">What can we bake for you?</label>
						<textarea
							id="details"
							name="details"
							rows="4"
							required
							placeholder="Occasion, date, flavours, how many people it needs to feed…"
							class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
							>{form?.values?.details ?? ''}</textarea
						>
					</div>

					<label class="text-ink-soft flex items-start gap-2 text-sm">
						<input type="checkbox" name="wantsNewsletter" value="true" class="accent-pink mt-0.5 h-4 w-4" />
						Keep me posted on new bakes and offers by email
					</label>

					<button
						type="submit"
						disabled={submitting}
						class="bg-pink hover:bg-pink-deep w-full rounded-full py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
					>
						{submitting ? 'Sending…' : 'Send enquiry'}
					</button>
				</form>
			{/if}
		</div>

		<!-- Contact details + map -->
		<div class="space-y-6">
			<div class="bg-blush rounded-[2rem] p-6 sm:p-8">
				<p class="font-display text-2xl text-ink">Smashin&rsquo; Bakes</p>
				<dl class="text-ink-soft mt-4 space-y-2 text-sm leading-relaxed">
					<div>
						<dt class="sr-only">Address</dt>
						<dd>9&ndash;11 Paisley Road,<br />Barrhead, G78 1HG</dd>
					</div>
					<div>
						<dt class="sr-only">Email</dt>
						<dd><a href="mailto:alanah@smashinbakes.co.uk" class="text-pink-deep font-medium hover:underline">alanah@smashinbakes.co.uk</a></dd>
					</div>
					<div>
						<dt class="sr-only">Phone</dt>
						<dd><a href="tel:+447404303180" class="text-pink-deep font-medium hover:underline">07404 303180</a></dd>
					</div>
				</dl>

				<div class="mt-5 flex flex-wrap gap-3">
					<a
						href={directionsUrl}
						target="_blank"
						rel="noreferrer"
						class="bg-pink hover:bg-pink-deep rounded-full px-5 py-2.5 text-sm font-semibold text-cream transition-colors"
					>
						Get directions
					</a>
					<a
						href="https://www.instagram.com/smashinbakes"
						target="_blank"
						rel="noreferrer"
						class="text-ink rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-ink/30"
					>
						Instagram
					</a>
				</div>

				<p class="font-display mt-8 text-xl text-ink">Opening hours</p>
				<dl class="text-ink-soft mt-3 space-y-1 text-sm">
					<div class="flex justify-between gap-4"><dt>Friday</dt><dd>10am &ndash; 4pm</dd></div>
					<div class="flex justify-between gap-4"><dt>Saturday</dt><dd>10am &ndash; 4pm</dd></div>
				</dl>
			</div>

			<div class="overflow-hidden rounded-[2rem]">
				<iframe
					title="Map showing Smashin' Bakes, 9–11 Paisley Road, Barrhead"
					src={mapEmbedUrl}
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					class="h-72 w-full border-0"
				></iframe>
			</div>
		</div>
	</div>
</section>
