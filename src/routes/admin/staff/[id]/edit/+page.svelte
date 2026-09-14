<script lang="ts">
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

	const resetPassword = $derived(form && 'tempPassword' in form ? (form.tempPassword as string | undefined) : undefined);

	function confirmDelete(event: SubmitEvent) {
		if (!confirm(`Delete "${data.member.name}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}

	function confirmReset(event: SubmitEvent) {
		if (!confirm(`Reset ${data.member.name}'s password? Their current password will stop working immediately.`)) {
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

<a href="/admin/staff" class="text-ink-soft hover:text-ink text-sm font-semibold">&larr; Staff accounts</a>
<h1 class="font-display mt-2 text-3xl text-ink">{data.member.name}</h1>

<form
	method="POST"
	action="?/update"
	class="border-ink/10 mt-6 max-w-xl rounded-2xl border bg-white/60 p-6"
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
		<p class="bg-blush text-ink mb-4 rounded-lg px-3 py-2 text-sm">Saved.</p>
	{/if}

	<div class="grid gap-6 sm:grid-cols-2">
		<div>
			<label for="name" class="text-ink-soft text-sm font-medium">Name</label>
			<input
				id="name"
				name="name"
				required
				disabled={lockedForOthers}
				value={data.member.name}
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 disabled:opacity-50"
			/>
		</div>

		<div>
			<label for="email" class="text-ink-soft text-sm font-medium">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				disabled={lockedForOthers}
				value={data.member.email}
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 disabled:opacity-50"
			/>
		</div>

		<div>
			<label for="role" class="text-ink-soft text-sm font-medium">Role</label>
			<select
				id="role"
				name="role"
				disabled={data.isSelf || lockedForOthers}
				class="border-ink/15 focus:ring-pink/40 mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 disabled:opacity-50"
			>
				<option value="staff" selected={data.member.role === 'staff'}>Staff</option>
				<option value="admin" selected={data.member.role === 'admin'}>Admin</option>
			</select>
		</div>

		<div class="flex items-end pb-2.5">
			<label class="text-ink-soft flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					name="isActive"
					value="true"
					checked={data.member.isActive}
					disabled={data.isSelf || lockedForOthers}
					class="accent-pink h-4 w-4 disabled:opacity-50"
				/>
				Active (can log in)
			</label>
		</div>

		{#if data.isSelf}
			<p class="text-ink-soft/70 -mt-2 text-xs sm:col-span-2">
				You can't change your own role or active status here.
			</p>
		{:else if lockedForOthers}
			<p class="text-ink-soft/70 -mt-2 text-xs sm:col-span-2">
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
			class="bg-pink hover:bg-pink-deep rounded-full px-6 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
		>
			{submitting ? 'Saving…' : 'Save changes'}
		</button>
		<button
			type="submit"
			disabled={submitting || lockedForOthers}
			onclick={() => (closeAfterSave = true)}
			class="text-ink rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold transition-colors hover:border-ink/30 disabled:opacity-60"
		>
			Save &amp; close
		</button>
	</div>
</form>

{#if !data.isSelf && !lockedForOthers}
	<div class="border-ink/10 mt-4 max-w-xl rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Reset password</h2>
		<p class="text-ink-soft mt-1 text-sm">
			If {data.member.name.split(' ')[0]} lost or mistyped their password and can't log in, generate a new
			one here — it replaces their current password immediately and signs them out of any active session.
		</p>

		{#if resetPassword}
			<div class="bg-blush mt-4 rounded-xl p-4">
				<p class="text-ink text-sm font-medium">New password for {data.member.name}</p>
				<p class="text-ink-soft mt-1 text-xs">This won't be shown again — copy it now and pass it on securely.</p>
				<div class="mt-3 flex items-center gap-2">
					<button
						type="button"
						onclick={(e) => selectAllText(e.currentTarget)}
						class="border-pink/30 bg-white text-ink flex-1 truncate rounded-lg border-2 border-dashed px-3 py-2 text-left font-mono text-sm"
					>
						{resetPassword}
					</button>
					<button
						type="button"
						onclick={copyPassword}
						class="bg-pink hover:bg-pink-deep shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-cream transition-colors"
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
				class="text-ink rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-ink/30 disabled:opacity-60"
			>
				{resetting ? 'Resetting…' : 'Generate new password'}
			</button>
		</form>
	</div>

	<form method="POST" action="?/delete" use:enhance onsubmit={confirmDelete} class="mt-4 max-w-xl">
		<button type="submit" class="text-sm text-red-600/70 hover:text-red-600">Delete this account</button>
	</form>
{/if}
