<script lang="ts">
	import TickGuide from '$lib/components/admin/TickGuide.svelte';
</script>

<TickGuide
	title="Connect the Facebook Page for posting"
	intro="These steps let me post your menus and updates to your Facebook Page, without you ever sharing your password. About 20 minutes."
	storageKey="facebook-setup-ticks"
	notes={[
		{
			heading: 'Good to know',
			items: [
				'You need to be an **admin of the Facebook Page** to do this.',
				'I will **never see your Facebook password**. You give me access to the Page only, and you can remove it whenever you like.',
				'Facebook changes its screens often, so the wording may be slightly different. Please let me know if something doesn’t match and we’ll work it out together.'
			]
		}
	]}
	parts={[
		{
			heading: 'Part 1 · Keep your account safe',
			steps: [
				{
					text: 'Please turn on **two-step login** for your Facebook account.',
					detail:
						'In Facebook, go to Settings, then Accounts Centre, then Password and security, then Two-factor authentication. It means a stolen password alone can’t get into your Page.',
					link: { href: 'https://www.facebook.com/settings', label: 'Open Facebook settings' }
				}
			]
		},
		{
			heading: 'Part 2 · Set up Meta Business Suite',
			steps: [
				{
					text: 'Go to **business.facebook.com** and sign in with the Facebook account that is an admin of your Page.',
					link: { href: 'https://business.facebook.com', label: 'Open Meta Business Suite' }
				},
				{
					text: 'If it asks you to create a **business portfolio**, please do (call it “Smashin’ Bakes”). If you already have one, use that.'
				},
				{
					text: 'Please check that your Facebook Page is inside the portfolio. In **Business settings**, open **Accounts**, then **Pages**. If your Page isn’t listed, press **Add** and choose it.'
				}
			]
		},
		{
			heading: 'Part 3 · Give me access (without sharing your password)',
			steps: [
				{
					text: 'In **Business settings**, open **Users**, then **People**, and press **Add**.'
				},
				{
					text: 'Enter my email address, **williamjamesellis@outlook.com**, and choose **Employee access**.'
				},
				{
					text: 'When it asks which assets I can use, please choose your **Page** and switch on **Content** (it may say “Create content” or “Manage Page”). You don’t need to give me anything else.',
					detail:
						'Then press **Invite** (or **Save**). I’ll get an email and accept the invitation.'
				}
			]
		},
		{
			heading: 'Part 4 · Let me know',
			steps: [
				{
					text: 'Please let me know the **exact name of your Page** (or its web address) and that you’ve sent the invitation. I’ll take it from there.'
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
