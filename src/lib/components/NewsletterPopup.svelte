<script lang="ts">
	import { fly } from 'svelte/transition';
	import NewsletterSignup from './NewsletterSignup.svelte';

	let { welcomeOffer }: { welcomeOffer: { code: string; description: string } } = $props();

	const STORAGE_KEY = 'newsletter-popup-dismissed';
	let visible = $state(false);

	function markDismissed() {
		try {
			localStorage.setItem(STORAGE_KEY, '1');
		} catch {
			// private browsing / storage blocked — worst case it can show again next visit
		}
	}

	function dismiss() {
		visible = false;
		markDismissed();
	}

	$effect(() => {
		let alreadyDismissed = false;
		try {
			alreadyDismissed = localStorage.getItem(STORAGE_KEY) === '1';
		} catch {
			// treat as not-dismissed if storage isn't readable
		}
		if (alreadyDismissed) return;

		let shown = false;
		// Triggers once someone's actually engaged with the page — scrolled a
		// third of the way down, or past 600px on a long page — rather than
		// popping up the moment they land, which is what makes popups feel
		// like a hard sell instead of a well-timed offer.
		function maybeShow() {
			if (shown) return;
			const scrollable = document.documentElement.scrollHeight - window.innerHeight;
			const ratio = scrollable > 0 ? window.scrollY / scrollable : 1;
			if (window.scrollY > 600 || ratio > 0.35) {
				shown = true;
				visible = true;
				window.removeEventListener('scroll', maybeShow);
			}
		}
		window.addEventListener('scroll', maybeShow, { passive: true });
		return () => window.removeEventListener('scroll', maybeShow);
	});
</script>

{#if visible}
	<div class="fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96" transition:fly={{ y: 24, duration: 300 }}>
		<div class="border-pink/20 shadow-soft relative rounded-2xl border bg-cream p-5">
			<button
				type="button"
				onclick={dismiss}
				aria-label="Close"
				class="text-ink-soft hover:text-ink absolute top-3 right-3 text-lg leading-none"
			>
				&times;
			</button>
			<p class="font-display text-ink pr-6 text-lg">Get the inside scoop</p>
			<p class="text-ink-soft mt-1 text-sm leading-relaxed">
				Specials, new bakes and offers — sign up now for <strong class="text-ink">{welcomeOffer.description}</strong>.
			</p>
			<div class="mt-3">
				<NewsletterSignup source="popup" variant="minimal" offer={welcomeOffer} onSuccess={markDismissed} />
			</div>
		</div>
	</div>
{/if}
