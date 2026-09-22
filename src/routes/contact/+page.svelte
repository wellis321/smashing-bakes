<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import BespokeOrderForm from '$lib/components/BespokeOrderForm.svelte';

	const address = '9-11 Paisley Road, Barrhead, G78 1HG';
	const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
	const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
</script>

<SeoHead
	title="Contact — Smashin' Bakes"
	description="Get in touch with Smashin' Bakes in Barrhead — bespoke cake enquiries, address, opening hours and how to pre-order."
/>

<section class="mx-auto max-w-5xl px-5 pt-14 pb-8 sm:px-8">
	<p class="text-sm font-semibold tracking-widest text-pink-deep uppercase">Get in touch</p>
	<h1 class="mt-2 font-display text-4xl text-ink sm:text-5xl">Looking for something different?</h1>
	<p class="mt-4 max-w-xl leading-relaxed text-ink-soft">
		Our Smashin&rsquo; baker Alanah can come up with something amazing for your extra special
		occasion. Just get in touch and we&rsquo;ll see what we can do for you.
	</p>
</section>

<section class="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
	<div class="grid gap-8 lg:grid-cols-2 lg:items-start">
		<BespokeOrderForm />

		<!-- Contact details + map -->
		<div class="space-y-6">
			<div class="rounded-[2rem] bg-blush p-6 sm:p-8">
				<p class="font-display text-2xl text-ink">Smashin&rsquo; Bakes</p>
				<dl class="mt-4 space-y-2 text-sm leading-relaxed text-ink-soft">
					<div>
						<dt class="sr-only">Address</dt>
						<dd>9&ndash;11 Paisley Road,<br />Barrhead, G78 1HG</dd>
					</div>
					<div>
						<dt class="sr-only">Email</dt>
						<dd>
							<a
								href="mailto:alanah@smashinbakes.co.uk"
								class="font-medium text-pink-deep hover:underline">alanah@smashinbakes.co.uk</a
							>
						</dd>
					</div>
					<div>
						<dt class="sr-only">Phone</dt>
						<dd>
							<a href="tel:+447404303180" class="font-medium text-pink-deep hover:underline"
								>07404 303180</a
							>
						</dd>
					</div>
				</dl>

				<div class="mt-5 flex flex-wrap gap-3">
					<a
						href={directionsUrl}
						target="_blank"
						rel="noreferrer"
						class="rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-deep"
					>
						Get directions
					</a>
					<a
						href="https://www.instagram.com/smashinbakes"
						target="_blank"
						rel="noreferrer"
						class="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
					>
						Instagram
					</a>
				</div>

				<p class="mt-8 font-display text-xl text-ink">Opening hours</p>
				<dl class="mt-3 space-y-1 text-sm text-ink-soft">
					<div class="flex justify-between gap-4">
						<dt>Friday</dt>
						<dd>10am &ndash; 4pm</dd>
					</div>
					<div class="flex justify-between gap-4">
						<dt>Saturday</dt>
						<dd>10am &ndash; 4pm</dd>
					</div>
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
