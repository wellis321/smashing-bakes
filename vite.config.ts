import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			// Put the (small) stylesheets straight into each page instead of making the browser
			// fetch them first: on a phone connection that wait was about a second.
			inlineStyleThreshold: 120000,
			// Hostinger's proxy tells the app it is being served from the free
			// *.hostingersite.com address, so the browser's real address has to be
			// listed here or every form post is refused as "cross-site".
			csrf: {
				trustedOrigins: [
					'https://smashinbakes.com',
					'https://www.smashinbakes.com',
					'https://plum-fox-139692.hostingersite.com'
				]
			},
			typescript: {
				config: (config) => {
					config.include.push('../drizzle.config.ts');
				}
			}
		})
	]
});
