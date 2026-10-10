<script lang="ts">
	import TickGuide from '$lib/components/admin/TickGuide.svelte';
</script>

<TickGuide
	title="Connect Instagram for posting"
	intro="These steps let me post your menus and updates to your Instagram account, without you ever sharing your password. About 20 minutes. It's best to do the Facebook guide first."
	storageKey="instagram-setup-ticks"
	notes={[
		{
			heading: 'Good to know',
			items: [
				'Instagram needs a **Professional account** (Business or Creator) that is linked to your Facebook Page. It’s free, and you can switch back whenever you like.',
				'Instagram posts need a **picture or video**, so I’ll post your menu as an image.',
				'I will **never see your Instagram password**. You give me access to the account only, and you can remove it any time.',
				'Instagram changes its screens often, so the wording may be slightly different. Please let me know if something doesn’t match.'
			]
		}
	]}
	parts={[
		{
			heading: 'Part 1 · Keep your account safe',
			steps: [
				{
					text: 'Please turn on **two-step login** for Instagram.',
					detail:
						'In the Instagram app, open your profile, then the menu, then Settings and privacy, then Accounts Centre, then Password and security, then Two-factor authentication.'
				}
			]
		},
		{
			heading: 'Part 2 · Check it’s a Professional account',
			steps: [
				{
					text: 'In the Instagram app, open your profile, then the **menu** (three lines), then **Settings and privacy**, then **Account type and tools**.',
					detail:
						'If it says “Switch to professional account”, please press it. Choose **Business** and pick the category **Bakery**. If it already says “Switch to personal account”, it’s already a professional account, so you can move on.'
				}
			]
		},
		{
			heading: 'Part 3 · Link it to your Facebook Page',
			steps: [
				{
					text: 'In the Instagram app, press **Edit profile**, then **Page** (under Public business information), and choose your **Smashin’ Bakes Facebook Page**.',
					detail:
						'If you’re asked to log in to Facebook, please use the account that is an admin of the Page.'
				},
				{
					text: 'Please check it worked: your Facebook Page should now show your Instagram account as linked (in the Page’s settings, under Linked accounts).'
				}
			]
		},
		{
			heading: 'Part 4 · Give me access (without sharing your password)',
			steps: [
				{
					text: 'Go to **business.facebook.com**, open **Business settings**, then **Accounts**, then **Instagram accounts**, and press **Add**. Log in to your Instagram account when asked.',
					link: { href: 'https://business.facebook.com', label: 'Open Meta Business Suite' }
				},
				{
					text: 'Open **Users**, then **People**, choose me (**williamjamesellis@outlook.com**) and press **Assign assets**. If I’m not there yet, add me first, as in the Facebook guide.'
				},
				{
					text: 'Choose **Instagram accounts**, pick yours, and switch on **Content** (it may say “Create content”). Then press **Save**.'
				}
			]
		},
		{
			heading: 'Part 5 · Let me know',
			steps: [
				{
					text: 'Please let me know your **Instagram username** and that you’ve finished. I’ll take it from there.'
				}
			]
		}
	]}
	after={{
		heading: 'What happens next',
		items: [
			'I’ll set the posting up so **nothing goes out until you’ve approved it**, unless you’d prefer it to be automatic.',
			'You can **remove my access at any time** in Business settings, under Users, then People.',
			'Please tell me what you’d like posted: the weekly menu, new products, promotions, or all three.'
		]
	}}
/>
