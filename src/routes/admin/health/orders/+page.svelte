<script lang="ts">
	import { formatPence } from '$lib/utils/money';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const maxWeekly = $derived(Math.max(1, ...(data.sales?.weekly.map((w) => w.revenue) ?? [1])));
	const changeText = (now: number, before: number) => {
		if (before === 0) return now === 0 ? 'no change' : 'new';
		const p = Math.round(((now - before) / before) * 100);
		return `${p > 0 ? '+' : ''}${p}%`;
	};
	const changeTone = (now: number, before: number) =>
		now > before ? 'text-green-700' : now < before ? 'text-red-700' : 'text-ink-soft';
</script>

<!-- Sales -->
<h2 class="mt-6 font-display text-2xl text-ink">Orders and growth</h2>
{#if data.sales}
	<p class="mt-1 text-sm text-ink-soft">
		The last 30 days compared with the 30 days before. These are orders placed on the website
		(cancelled ones are left out). Customers pay when they collect until online payment is switched
		on, so this is the value of orders, not money received.
	</p>
	<div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.sales.periods as p (p.label)}
			<div class="rounded-2xl border border-ink/10 bg-white/60 p-4">
				<p class="text-sm font-semibold text-ink-soft">{p.label}</p>
				<p class="mt-1 font-display text-3xl text-ink">{p.money ? formatPence(p.now) : p.now}</p>
				<p class="mt-1 text-sm {changeTone(p.now, p.before)}">
					{changeText(p.now, p.before)}
					<span class="text-ink-soft">
						(before: {p.money ? formatPence(p.before) : p.before})
					</span>
				</p>
			</div>
		{/each}
	</div>

	<h3 class="mt-6 text-base font-semibold text-ink">Value of orders each week (last 12 weeks)</h3>
	<div
		class="mt-2 flex h-40 items-end gap-1.5 rounded-2xl border border-ink/10 bg-white/60 p-4"
		role="img"
		aria-label="Weekly sales for the last 12 weeks"
	>
		{#each data.sales.weekly as w (w.weekStart)}
			<div
				class="flex h-full flex-1 flex-col items-center justify-end gap-1"
				title={`Week of ${w.weekStart}: ${formatPence(w.revenue)} from ${w.orders} orders`}
			>
				<div
					class="w-full rounded-t bg-pink-deep"
					style:height={`${Math.max(2, (w.revenue / maxWeekly) * 100)}%`}
				></div>
			</div>
		{/each}
	</div>
	<p class="mt-1 text-xs text-ink-soft">
		Hover a bar for that week's total value and number of orders.
	</p>

	<div class="mt-6 grid gap-6 lg:grid-cols-2">
		<div class="rounded-2xl border border-ink/10 bg-white/60 p-4">
			<h3 class="text-base font-semibold text-ink">Best sellers (last 30 days)</h3>
			{#if data.sales.topProducts.length === 0}
				<p class="mt-2 text-sm text-ink-soft">No orders in the last 30 days yet.</p>
			{:else}
				<table class="mt-2 w-full text-sm">
					<tbody>
						{#each data.sales.topProducts as t (t.name)}
							<tr class="border-t border-ink/10 first:border-0">
								<td class="py-2 pr-2 text-ink">{t.name}</td>
								<td class="py-2 text-right text-ink-soft">{t.quantity} sold</td>
								<td class="py-2 pl-3 text-right font-semibold text-ink">{formatPence(t.revenue)}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
		<div class="rounded-2xl border border-ink/10 bg-white/60 p-4">
			<h3 class="text-base font-semibold text-ink">Since the start</h3>
			<ul class="mt-2 space-y-1 text-sm text-ink-soft">
				<li>
					<strong class="text-ink">{data.sales.totals.orders}</strong> orders worth
					<strong class="text-ink">{formatPence(data.sales.totals.revenue)}</strong>
				</li>
				<li>
					{#if data.sales.repeatRate != null}
						<strong class="text-ink">{data.sales.repeatRate}%</strong> of customers have ordered more
						than once
					{:else}
						No repeat-customer figure yet
					{/if}
				</li>
			</ul>
		</div>
	</div>
{:else}
	<p class="mt-2 text-sm text-ink-soft">The sales figures could not be loaded just now.</p>
{/if}
