<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>My account — Smashin&rsquo; Bakes</title>
</svelte:head>

<section class="mx-auto max-w-2xl px-5 pt-14 pb-24 sm:px-8">
	<p class="text-pink-deep text-sm font-semibold tracking-widest uppercase">My account</p>
	<h1 class="font-display mt-2 text-4xl text-ink sm:text-5xl">Hi, {data.customer.name.split(' ')[0]}.</h1>

	<div class="bg-blush mt-8 rounded-2xl p-6">
		<dl class="space-y-3 text-sm">
			<div class="flex justify-between gap-4">
				<dt class="text-ink-soft">Name</dt>
				<dd class="text-ink font-medium">{data.customer.name}</dd>
			</div>
			<div class="flex justify-between gap-4">
				<dt class="text-ink-soft">Email</dt>
				<dd class="text-ink font-medium">{data.customer.email}</dd>
			</div>
		</dl>
	</div>

	<div class="mt-8 flex flex-wrap items-center gap-4">
		<a
			href="/vote"
			class="bg-pink hover:bg-pink-deep rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors"
		>
			Vote in this week&rsquo;s poll
		</a>
		<form method="POST" action="/account/logout">
			<button type="submit" class="text-ink-soft hover:text-ink text-sm font-semibold underline decoration-ink/20 underline-offset-4">
				Sign out
			</button>
		</form>
	</div>
</section>
