<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// "dbuser@1.2.3.4" → "1.2.3.4"
	const seenAs = $derived(
		data.userAs.includes('@') ? data.userAs.split('@').slice(1).join('@') : ''
	);
</script>

<svelte:head>
	<title>Database check — Admin</title>
</svelte:head>

<h1 class="font-display text-3xl text-ink">Database connection check</h1>
<p class="mt-2 max-w-xl text-sm text-ink-soft">
	Temporary page for admins. It shows the address the database sees this site connecting from.
</p>

{#if data.dbError}
	<p class="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{data.dbError}</p>
{:else}
	<div class="mt-6 rounded-xl border border-ink/10 bg-white/60 p-5">
		<p class="text-sm text-ink-soft">The database sees this site connecting from:</p>
		<p class="mt-1 text-2xl font-semibold break-all text-ink">{seenAs || '(unknown)'}</p>

		<dl class="mt-5 space-y-3 text-sm">
			<div>
				<dt class="text-ink-soft">Connected as</dt>
				<dd class="font-mono break-all text-ink">{data.userAs}</dd>
			</div>
			<div>
				<dt class="text-ink-soft">Matched against the access rule</dt>
				<dd class="font-mono break-all text-ink">{data.grantedAs}</dd>
			</div>
			<div>
				<dt class="text-ink-soft">This server's address on the internet</dt>
				<dd class="font-mono break-all text-ink">{data.outboundIp || '(could not look up)'}</dd>
			</div>
		</dl>
	</div>
{/if}
