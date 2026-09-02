# by samantha brown

## `/ugc` — the UGC portfolio page

`public/ugc/` is a **separate static page** served at bysamanthabrown.com/ugc. It is built in its
own repo (`Sam-UGC-Portfolio-Site`, Next.js) and synced in here as plain files — nothing in
`src/` knows about it, it is not in the nav, and it does not link back to the main site. Same
domain, separate page, on purpose.

- Update it from the UGC repo: `SITE_DIR=<this folder> npm run sync:site`, then commit `public/ugc/`.
- `netlify.toml` routes `/ugc/*` to those files ahead of the SPA catch-all.
- `public/sitemap.xml` lists `/ugc/` — that is how search finds it, since nothing links there.
- `npm run build` first runs `scripts/check-ugc-demo.mjs`, which **refuses a production deploy**
  while `public/ugc/` is a demo or placeholder build. Deploy previews and branch deploys are
  allowed through with a warning, so a demo can be reviewed on a `*.netlify.app` URL — but it
  must never be merged to `main` as-is. To look at one locally, `npx vite build` skips the guard.
- `public/ugc/demo/` holds the stand-in posters and clip while the page is in demo. A real sync
  replaces the whole folder; real media comes from a video host, not from here.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
