<script lang="ts">
	import HelpLink from '$lib/components/admin/HelpLink.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
	let closeAfterSave = $state(false);
	let resetting = $state(false);
	let copied = $state(false);

	// Locked for everyone except the account's own owner — matches the
	// server-side checks in +page.server.ts, which refuse these actions
	// regardless of what the (disabled) form fields say.
	const lockedForOthers = $derived(data.member.isProtected && !data.isSelf);

	const resetPassword = $derived(
		form && 'tempPassword' in form ? (form.tempPassword as string | undefined) : undefined
	);

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete "${data.member.name}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}

	function confirmReset(event: SubmitEvent) {
		if (
			!confirm(
				`Reset ${data.member.name}'s password? Their current password will stop working immediately.`
			)
		) {
			event.preventDefault();
		}
	}

	async function copyPassword() {
		if (!resetPassword) return;
		try {
			await navigator.clipboard.writeText(resetPassword);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// clipboard unavailable — the password is still visible on screen to copy manually
		}
	}

	function selectAllText(el: HTMLElement) {
		const range = document.createRange();
		range.selectNodeContents(el);
		const selection = window.getSelection();
		selection?.removeAllRanges();
		selection?.addRange(range);
	}
</script>

<svelte:head>
	<title>Edit {data.member.name} — Admin</title>
</svelte:head>

<a href="/admin/staff" class="text-sm font-semibold text-ink-soft hover:text-ink"
	>&larr; Staff accounts</a
>
<div class="flex items-center gap-2">
	<h1 class="mt-2 font-display text-3xl text-ink">{data.member.name}</h1>
	<HelpLink section="staff" task="add-staff" />
</div>

<form
	method="POST"
	action="?/update"
	class="mt-6 max-w-xl rounded-2xl border border-ink/10 bg-white/60 p-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			submitting = false;
			if (closeAfterSave && result.type === 'success') goto('/admin/staff');
			closeAfterSave = false;
		};
	}}
>
	{#if form?.message}
		<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
	{/if}
	{#if form?.success}
		<p class="mb-4 rounded-lg bg-blush px-3 py-2 text-sm text-ink">Saved.</p>
	{/if}

	<div class="grid gap-6 sm:grid-cols-2">
		<div>
			<label for="name" class="text-sm font-medium text-ink-soft">Name</label>
			<input
				id="name"
				name="name"
				required
				disabled={lockedForOthers}
				value={data.member.name}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40 disabled:opacity-50"
			/>
		</div>

		<div>
			<label for="email" class="text-sm font-medium text-ink-soft">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				disabled={lockedForOthers}
				value={data.member.email}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40 disabled:opacity-50"
			/>
		</div>

		<div>
			<label for="role" class="text-sm font-medium text-ink-soft">Role</label>
			<select
				id="role"
				name="role"
				disabled={data.isSelf || lockedForOthers}
				class="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink/40 disabled:opacity-50"
			>
				<option value="staff" selected={data.member.role === 'staff'}>Staff</option>
				<option value="admin" selected={data.member.role === 'admin'}>Admin</option>
			</select>
		</div>

		<div class="flex items-end pb-2.5">
			<label class="flex items-center gap-2 text-sm text-ink-soft">
				<input
					type="checkbox"
					name="isActive"
					value="true"
					checked={data.member.isActive}
					disabled={data.isSelf || lockedForOthers}
					class="h-4 w-4 accent-pink disabled:opacity-50"
				/>
				Active (can log in)
			</label>
		</div>

		{#if data.isSelf}
			<p class="-mt-2 text-xs text-ink-soft/70 sm:col-span-2">
				You can't change your own role or active status here.
			</p>
		{:else if lockedForOthers}
			<p class="-mt-2 text-xs text-ink-soft/70 sm:col-span-2">
				This account is protected — only {data.member.name.split(' ')[0]} can change it, by logging in
				as themselves.
			</p>
		{/if}
	</div>

	<div class="mt-6 flex gap-3">
		<button
			type="submit"
			disabled={submitting || lockedForOthers}
			onclick={() => (closeAfterSave = false)}
			class="rounded-full bg-pink-deep px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pink-darker disabled:opacity-60"
		>
			{submitting ? 'Saving…' : 'Save changes'}
		</button>
		<button
			type="submit"
			disabled={submitting || lockedForOthers}
			onclick={() => (closeAfterSave = true)}
			class="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30 disabled:opacity-60"
		>
			Save &amp; close
		</button>
	</div>
</form>

{#if !data.isSelf && !lockedForOthers}
	<div class="mt-4 max-w-xl rounded-2xl border border-ink/10 bg-white/60 p-6">
		<h2 class="text-lg font-semibold text-ink">Reset password</h2>
		<p class="mt-1 text-sm text-ink-soft">
			If {data.member.name.split(' ')[0]} lost or mistyped their password and can't log in, generate a
			new one here — it replaces their current password immediately and signs them out of any active session.
		</p>

		{#if resetPassword}
			<div class="mt-4 rounded-xl bg-blush p-4">
				<p class="text-sm font-medium text-ink">New password for {data.member.name}</p>
				<p class="mt-1 text-xs text-ink-soft">
					This won't be shown again — copy it now and pass it on securely.
				</p>
				<div class="mt-3 flex items-center gap-2">
					<button
						type="button"
						onclick={(e) => selectAllText(e.currentTarget)}
						class="flex-1 truncate rounded-lg border-2 border-dashed border-pink/30 bg-white px-3 py-2 text-left font-mono text-sm text-ink"
					>
						{resetPassword}
					</button>
					<button
						type="button"
						onclick={copyPassword}
						class="shrink-0 rounded-full bg-pink-deep px-3 py-2 text-xs font-semibold text-cream transition-colors hover:bg-pink-darker"
					>
						{copied ? 'Copied!' : 'Copy'}
					</button>
				</div>
			</div>
		{/if}

		<form
			method="POST"
			action="?/resetPassword"
			class="mt-4"
			use:enhance={() => {
				resetting = true;
				return async ({ update }) => {
					await update({ reset: false });
					resetting = false;
				};
			}}
			onsubmit={confirmReset}
		>
			<button
				type="submit"
				disabled={resetting}
				class="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30 disabled:opacity-60"
			>
				{resetting ? 'Resetting…' : 'Generate new password'}
			</button>
		</form>
	</div>

	<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4 max-w-xl">
		<button type="submit" class="text-sm text-red-600/70 hover:text-red-600"
			>Delete this account</button
		>
	</form>
{/if}
