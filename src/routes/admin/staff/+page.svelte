<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let creating = $state(false);
	let copied = $state(false);
	let cleared = $state(false);

	const ownId = $derived(page.data.staff?.id);
	// `form` is a union across this page's three actions — only `create`'s
	// failure returns `values`, so narrow with an `in` check rather than
	// optional-chaining into a property some union members don't have.
	const prefill: { name: string; email: string; role: string } = $derived(
		!cleared && form && 'values' in form
			? (form.values as { name: string; email: string; role: string })
			: { name: '', email: '', role: 'staff' }
	);

	function formatDate(iso: string | Date) {
		return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function confirmDelete(event: SubmitEvent, name: string) {
		if (!confirm(`Delete "${name}"? This can't be undone.`)) {
			event.preventDefault();
		}
	}

	// Clicking the password selects exactly its text — a stray leading/trailing
	// space from a manual drag-select is a real way to end up with a password
	// that silently doesn't match what's stored.
	function selectAllText(el: HTMLElement) {
		const range = document.createRange();
		range.selectNodeContents(el);
		const selection = window.getSelection();
		selection?.removeAllRanges();
		selection?.addRange(range);
	}

	async function copyPassword() {
		if (!form?.tempPassword) return;
		try {
			await navigator.clipboard.writeText(form.tempPassword);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// clipboard unavailable — the password is still visible on screen to copy manually
		}
	}
</script>

<svelte:head>
	<title>Staff accounts — Admin</title>
</svelte:head>

<h1 class="font-display text-3xl text-ink">Staff accounts</h1>
<p class="text-ink-soft mt-1 max-w-lg text-sm">
	Who can log into this admin area. There's no email sending set up, so a new account's password is
	generated here and shown once — you'll need to pass it on to them directly.
</p>

<div class="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
	<div class="border-ink/10 rounded-2xl border bg-white/60 p-6">
		<h2 class="text-ink text-lg font-semibold">Add a staff account</h2>

		{#if !cleared && form?.success && form.tempPassword}
			<div class="bg-blush mt-4 rounded-xl p-4">
				<p class="text-ink text-sm font-medium">Account created for {form.createdName} ({form.createdEmail})</p>
				<p class="text-ink-soft mt-1 text-xs">
					This password won't be shown again — copy it now and pass it on securely. The form below still
					shows this account so it's clear which password goes with who.
				</p>
				<div class="mt-3 flex items-center gap-2">
					<button
						type="button"
						onclick={(e) => selectAllText(e.currentTarget)}
						class="border-pink/30 bg-white text-ink flex-1 truncate rounded-lg border-2 border-dashed px-3 py-2 text-left font-mono text-sm"
					>
						{form.tempPassword}
					</button>
					<button
						type="button"
						onclick={copyPassword}
						class="bg-pink hover:bg-pink-deep shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-cream transition-colors"
					>
						{copied ? 'Copied!' : 'Copy'}
					</button>
				</div>
				<button
					type="button"
					onclick={() => (cleared = true)}
					class="text-ink-soft hover:text-ink mt-3 text-xs font-semibold underline underline-offset-2"
				>
					Add another account
				</button>
			</div>
		{/if}

		<form
			method="POST"
			action="?/create"
			class="mt-4 space-y-4"
			use:enhance={() => {
				creating = true;
				cleared = false;
				return async ({ update }) => {
					await update({ reset: false });
					creating = false;
				};
			}}
		>
			<div>
				<label for="name" class="text-ink-soft text-sm font-medium">Name</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					value={prefill.name}
					class="border-ink/15 focus:ring-pink/40 mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				/>
			</div>
			<div>
				<label for="email" class="text-ink-soft text-sm font-medium">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					value={prefill.email}
					class="border-ink/15 focus:ring-pink/40 mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				/>
			</div>
			<div>
				<label for="role" class="text-ink-soft text-sm font-medium">Role</label>
				<select
					id="role"
					name="role"
					class="border-ink/15 focus:ring-pink/40 mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
				>
					<option value="staff" selected={prefill.role === 'staff'}>Staff</option>
					<option value="admin" selected={prefill.role === 'admin'}>Admin</option>
				</select>
				<p class="text-ink-soft/70 mt-1.5 text-xs">
					Admins can manage staff accounts; both roles currently have the same access to everything else.
				</p>
			</div>

			{#if form?.message}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
			{/if}

			<button
				type="submit"
				disabled={creating}
				class="bg-pink hover:bg-pink-deep rounded-full px-5 py-2.5 text-sm font-semibold text-cream transition-colors disabled:opacity-60"
			>
				{creating ? 'Creating…' : 'Create account'}
			</button>
		</form>
	</div>

	<div>
		<h2 class="text-ink text-lg font-semibold">Everyone with access</h2>
		<div class="border-ink/10 mt-4 divide-y divide-ink/10 rounded-2xl border bg-white/60">
			{#each data.staffList as member (member.id)}
				<div class="flex flex-wrap items-center gap-3 px-4 py-3">
					<a href={`/admin/staff/${member.id}/edit`} class="min-w-0 flex-1">
						<p class="text-ink truncate text-sm font-medium">
							{member.name}
							{#if member.id === ownId}<span class="text-ink-soft font-normal">(you)</span>{/if}
						</p>
						<p class="text-ink-soft truncate text-xs">{member.email}</p>
					</a>
					<span class="text-ink-soft shrink-0 text-xs">Joined {formatDate(member.createdAt)}</span>

					{#if member.id === ownId}
						<span class="bg-ink/5 text-ink-soft shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">
							{member.role}
						</span>
					{:else if member.isProtected}
						<span class="bg-ink/5 text-ink-soft shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">
							{member.role}
						</span>
						<span
							class="text-ink-soft shrink-0 text-xs italic"
							title="Only this account's own owner can change it"
						>
							Protected
						</span>
					{:else}
						<form method="POST" action="?/changeRole" use:enhance>
							<input type="hidden" name="id" value={member.id} />
							<input type="hidden" name="nextRole" value={member.role === 'admin' ? 'staff' : 'admin'} />
							<button
								type="submit"
								class={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
									member.role === 'admin' ? 'bg-pink/10 text-pink-deep' : 'bg-ink/5 text-ink-soft'
								}`}
							>
								{member.role} &middot; change
							</button>
						</form>
						<form method="POST" action="?/toggleActive" use:enhance>
							<input type="hidden" name="id" value={member.id} />
							<input type="hidden" name="nextValue" value={(!member.isActive).toString()} />
							<button
								type="submit"
								class={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
									member.isActive ? 'bg-ink/5 text-ink-soft' : 'bg-pink/10 text-pink-deep'
								}`}
							>
								{member.isActive ? 'Active' : 'Deactivated'}
							</button>
						</form>
						<a href={`/admin/staff/${member.id}/edit`} class="text-ink-soft hover:text-ink shrink-0 text-sm">Edit</a>
						<form method="POST" action="?/delete" use:enhance onsubmit={(e) => confirmDelete(e, member.name)}>
							<input type="hidden" name="id" value={member.id} />
							<button type="submit" class="shrink-0 text-sm text-red-600/70 hover:text-red-600">Delete</button>
						</form>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
