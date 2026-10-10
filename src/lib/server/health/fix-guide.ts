// Plain-English advice for each check, and who can act on it.
type Guide = { who: 'staff' | 'developer'; how: string };

const GUIDE: Record<string, Guide> = {
	status: {
		who: 'developer',
		how: 'The page is returning an error. This needs looking at in the server log.'
	},
	title: {
		who: 'developer',
		how: 'Page titles come from the website code (for a product, from its name). A clear title of 15–70 characters helps people and Google.'
	},
	description: {
		who: 'developer',
		how: 'The short summary shown in Google results should be 70–170 characters. For a product, writing a fuller description in Products fixes it.'
	},
	h1: { who: 'developer', how: 'Each page should have exactly one main heading.' },
	canonical: {
		who: 'developer',
		how: 'The page is not telling search engines its real address (https://smashinbakes.com).'
	},
	indexable: {
		who: 'developer',
		how: 'URGENT: this page is telling search engines not to list it.'
	},
	social: {
		who: 'developer',
		how: 'The page needs a title and picture for when it is shared on Facebook and similar.'
	},
	jsonld: {
		who: 'developer',
		how: 'The page is missing the hidden business/product details that search engines and AI read.'
	},
	lang: { who: 'developer', how: 'The page language is not set.' },
	alt: {
		who: 'developer',
		how: 'Some pictures have no description for people using screen readers.'
	},
	viewport: {
		who: 'developer',
		how: 'The page is not set up properly for phones, or blocks zooming.'
	},
	ttfb: {
		who: 'developer',
		how: 'The server is slow to answer. It may just be busy, so run again before worrying.'
	},
	load: { who: 'developer', how: 'The page text takes a long time to arrive.' },
	html: { who: 'developer', how: 'The page code is larger than it should be.' },
	images: {
		who: 'developer',
		how: 'The pictures on this page are heavy. Very large originals are the usual cause.'
	},
	compression: {
		who: 'developer',
		how: 'The page is not being compressed on its way to the visitor.'
	},
	robots: {
		who: 'developer',
		how: 'robots.txt is blocking search engines or is missing the sitemap line.'
	},
	sitemap: { who: 'developer', how: 'The sitemap is missing, empty, or lists the wrong address.' },
	llms: { who: 'developer', how: 'The AI summary file (llms.txt) cannot be reached.' },
	llmsfull: { who: 'developer', how: 'The full AI catalogue (llms-full.txt) cannot be reached.' },
	'404': { who: 'developer', how: 'Unknown addresses are not showing a proper “not found” page.' },
	headers: { who: 'developer', how: 'Some browser security protections are missing.' },
	https: { who: 'developer', how: 'Plain http:// addresses are not moving to secure https://.' },
	imgcache: {
		who: 'developer',
		how: 'Photos are not being saved by the browser for repeat visits.'
	},
	imgwebp: { who: 'developer', how: 'Photos are not being served in the small modern format.' },
	photos: {
		who: 'staff',
		how: 'A poster, gallery picture, category or product points at a photo that no longer exists. Open that item in the admin and choose the photo again from the library.'
	}
};

export function guideFor(checkId: string, page: string): Guide {
	// Product descriptions are something staff can fix themselves.
	if (checkId === 'description' && page.startsWith('/product/')) {
		return {
			who: 'staff',
			how: 'This product’s description is too short or missing. In Products, open it and write 1–2 sentences (about 70–170 characters) describing it.'
		};
	}
	return GUIDE[checkId] ?? { who: 'developer', how: 'This needs a closer look.' };
}

export const LIGHTHOUSE_GUIDE: Guide = {
	who: 'developer',
	how: 'Google Lighthouse lists this as something to improve. It usually needs a change to the website code.'
};
