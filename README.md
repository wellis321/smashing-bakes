# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.17.0 create --template minimal --types ts --add drizzle="database:mysql+mysql:mysql2+docker:no" sveltekit-adapter="adapter:node" tailwindcss="plugins:none" eslint prettier --install npm .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Deploying schema changes

This app is deployed on Hostinger's git-triggered Node.js hosting, which only
runs `npm run build` on push — **it never runs drizzle migrations**. Any
commit that adds a file under `drizzle/` needs its SQL applied to the
production database by hand, or the live site will start throwing 500s on
whatever route touches the new/changed table (with `ER_NO_SUCH_TABLE` /
`ER_BAD_FIELD_ERROR` logged to the Node.js runtime logs — see
`hooks.server.ts`'s `handleError`, which flags this specific failure shape).

Steps:

1. `git push` as normal and let the build finish.
2. Open the production database in phpMyAdmin (hPanel → Databases → the
   `u248320297_smashing_bakes` database → "Enter phpMyAdmin", or via the
   Hostinger MCP's `hosting_getPhpMyAdminLinkV1`).
3. Copy the new file(s) from `drizzle/000N_*.sql`, **remove every
   `--> statement-breakpoint` line** (that's a drizzle-kit-only delimiter,
   not valid SQL — phpMyAdmin's SQL tab will reject it), and run the
   remaining statements in the SQL tab, in file order.
4. If a `CREATE TABLE`/`ALTER TABLE` errors with "already exists", that
   statement already ran in a previous partial attempt — skip it and
   continue with the rest.
