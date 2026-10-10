<script lang="ts">
	import TickGuide from '$lib/components/admin/TickGuide.svelte';
</script>

<TickGuide
	title="Get the bakery found online"
	intro="The website is ready to be found. These steps tell Google, Bing, maps and AI assistants it exists. Most take a few minutes, and results appear over days or weeks, not instantly."
	storageKey="get-found-online-ticks"
	notes={[
		{
			heading: 'Already done on the website',
			items: [
				'A **sitemap** (a list of every page) is published for search engines, and `robots.txt` welcomes Google, Bing, Apple and the main AI assistants.',
				'Every page has the right title, description and **business details** (name, address, opening hours) in the form search engines and AI read.',
				'Products and breadcrumbs are marked up so they can show as **rich results**.',
				'A plain-text summary of the whole shop, kept up to date automatically, is published for AI assistants at **smashinbakes.com/llms.txt**.',
				'The site passes automated **accessibility checks** on every public page.'
			]
		},
		{
			heading: 'One rule that matters most',
			items: [
				'Use **exactly the same name, address, phone number and opening hours** everywhere: Google, Bing, Apple, Facebook, Instagram and the website. Search engines and AI trust a business more when its details agree.'
			]
		}
	]}
	parts={[
		{
			heading: 'Part 1 · Tell Google about the site',
			steps: [
				{
					text: 'Open **Google Search Console** and check **smashinbakes.com** is listed and verified.',
					link: { href: 'https://search.google.com/search-console', label: 'Open Search Console' }
				},
				{
					text: 'In the left menu choose **Sitemaps**, type **sitemap.xml** in the box and press **Submit**.',
					detail:
						'It may say “Couldn’t fetch” for a few minutes at first. That is normal, so please check back later.'
				},
				{
					text: 'Choose **URL inspection** at the top, paste **https://smashinbakes.com** and press **Request indexing**.'
				}
			]
		},
		{
			heading: 'Part 2 · Bing (it also feeds Microsoft Copilot, ChatGPT search and DuckDuckGo)',
			steps: [
				{
					text: 'Open **Bing Webmaster Tools**, sign in, and choose **Import from Google Search Console**. It brings everything across in a couple of clicks.',
					link: { href: 'https://www.bing.com/webmasters', label: 'Open Bing Webmaster Tools' }
				},
				{
					text: 'Check that the **sitemap** appears under Sitemaps. If it doesn’t, add **https://smashinbakes.com/sitemap.xml**.'
				}
			]
		},
		{
			heading: 'Part 3 · Google Business Profile (Google Maps and “near me” searches)',
			steps: [
				{
					text: 'Open Google Business Profile and **claim your listing** (or create one if there isn’t one). Use the name **Smashin’ Bakes**, the category **Bakery**, the address **9–11 Paisley Road, Barrhead G78 1HG**, and the website **https://smashinbakes.com**.',
					detail:
						'Google will ask you to verify it, often by video or a postcard. Please follow whatever it asks.',
					link: { href: 'https://business.google.com', label: 'Open Google Business Profile' }
				},
				{
					text: 'Add your **opening hours**, your **phone number**, a short description, and plenty of **photos** (the shopfront, the counter, your best bakes).'
				},
				{
					text: 'Ask a few happy customers for a **Google review**. Reviews help your ranking more than almost anything else.',
					detail:
						'In your profile, press “Ask for reviews” to get a link you can share on Facebook, Instagram or in the shop.'
				}
			]
		},
		{
			heading: 'Part 4 · Other places people and AI assistants look',
			steps: [
				{
					text: 'Open **Bing Places for Business** and import your Google listing.',
					link: { href: 'https://www.bingplaces.com', label: 'Open Bing Places' }
				},
				{
					text: 'Open **Apple Business Connect** and add the bakery, so it appears in Apple Maps and Siri.',
					link: { href: 'https://businessconnect.apple.com', label: 'Open Apple Business Connect' }
				},
				{
					text: 'On **Facebook, Instagram and TikTok**, check the website link is **https://smashinbakes.com** and the address and hours match the website.'
				},
				{
					text: 'Optional: add the bakery to a few **local directories**, such as Yell, FreeIndex and any Barrhead or East Renfrewshire business listings.',
					link: { href: 'https://www.yell.com', label: 'Open Yell' }
				}
			]
		},
		{
			heading: 'Part 5 · AI assistants',
			steps: [
				{
					text: 'There is no form to fill in for ChatGPT, Claude, Perplexity or Copilot. They find the bakery through Google and Bing, and by reading the site. Parts 1 to 4 are what put you in front of them.'
				},
				{
					text: 'Optional: add **https://smashinbakes.com/llms.txt** to a directory of these files, such as llmstxt.site.',
					link: { href: 'https://llmstxt.site', label: 'Open llmstxt.site' }
				},
				{
					text: 'In a few weeks, try asking an AI assistant things like “bakery in Barrhead” and “Smashin Bakes opening hours”, and let me know what it says.'
				}
			]
		}
	]}
	after={{
		heading: 'What to expect',
		items: [
			'Google usually lists a new site within days to a few weeks. Being on the first page for “bakery Barrhead” takes longer and depends on reviews and how many places mention you.',
			'**Keep things up to date.** When the opening hours change, please change them on the website (Settings), Google Business Profile, Facebook and Instagram on the same day.',
			'If something here looks different from what you see on screen, please let me know. These services change their menus often.'
		]
	}}
/>
