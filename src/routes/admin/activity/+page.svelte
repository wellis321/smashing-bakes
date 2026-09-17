<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const ACTION_LABEL: Record<string, string> = {
		login_success: 'Logged in',
		login_failed: 'Login failed',
		logout: 'Logged out',
		staff_created: 'Account created',
		staff_updated: 'Account updated',
		staff_role_changed: 'Role changed',
		staff_activated: 'Reactivated',
		staff_deactivated: 'Deactivated',
		staff_deleted: 'Account deleted',
		password_changed_self: 'Password changed',
		password_reset_by_admin: 'Password reset (by admin)',
		password_reset_requested: 'Password reset requested',
		password_reset_completed: 'Password reset completed'
	};

	const ACTION_TONE: Record<string, string> = {
		login_failed: 'bg-red-50 text-red-700',
		staff_deleted: 'bg-red-50 text-red-700',
		staff_deactivated: 'bg-red-50 text-red-700',
		login_success: 'bg-blush text-ink',
		staff_created: 'bg-blush text-ink'
	};

	function formatTime(iso: string | Date) {
		return new Date(iso).toLocaleString('en-GB', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Activity log — Admin</title>
</svelte:head>

<h1 class="font-display text-3xl text-ink">Activity log</h1>
<p class="mt-1 max-w-2xl text-sm text-ink-soft">
	Staff logins, logouts, and every change made to a staff account — most recent first. Shows the
	last {data.entries.length} events.
</p>

<div class="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white/60">
	<table class="w-full text-left text-sm">
		<thead>
			<tr
				class="border-b border-ink/10 text-xs font-semibold tracking-wide text-ink-soft uppercase"
			>
				<th class="px-4 py-3">When</th>
				<th class="px-4 py-3">Event</th>
				<th class="px-4 py-3">Who</th>
				<th class="px-4 py-3">On account</th>
				<th class="px-4 py-3">Detail</th>
				<th class="px-4 py-3">IP</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-ink/10">
			{#each data.entries as entry (entry.id)}
				<tr>
					<td class="px-4 py-2.5 whitespace-nowrap text-ink-soft">{formatTime(entry.createdAt)}</td>
					<td class="px-4 py-2.5">
						<span
							class={`rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
								ACTION_TONE[entry.action] ?? 'bg-ink/5 text-ink-soft'
							}`}
						>
							{ACTION_LABEL[entry.action] ?? entry.action}
						</span>
					</td>
					<td class="px-4 py-2.5 text-ink">{entry.actorEmail ?? '—'}</td>
					<td class="px-4 py-2.5 text-ink-soft">
						{entry.targetEmail && entry.targetEmail !== entry.actorEmail ? entry.targetEmail : '—'}
					</td>
					<td class="px-4 py-2.5 text-ink-soft">{entry.detail ?? '—'}</td>
					<td class="px-4 py-2.5 font-mono text-xs whitespace-nowrap text-ink-soft/70"
						>{entry.ipAddress ?? '—'}</td
					>
				</tr>
			{:else}
				<tr>
					<td colspan="6" class="px-4 py-8 text-center text-ink-soft">Nothing logged yet.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
