#!/usr/bin/env node
/**
 * Refuses to deploy the /ugc page while it still carries demo or placeholder
 * content. Runs at the front of `npm run build`, which is what Netlify calls.
 *
 * public/ugc/ is synced in from the UGC portfolio repo. That repo's own build
 * gate stops placeholders, but its `--preview` sync can copy a demo build over
 * for local review — and a demo build on this domain would publish invented
 * rates and brands under her real name. So it is checked again here, at the
 * last door before her Netlify deploy.
 *
 * Netlify sets CONTEXT to "production", "deploy-preview" or "branch-deploy".
 * Only production is refused. Deploy previews live on unindexed *.netlify.app
 * URLs and the page carries its own "demo content" banner, so they are the
 * right place to review a demo build — and the only way to exercise the /ugc
 * redirect rules on Netlify itself before merging.
 *
 * To look at a demo build locally, run `npx vite build` (no guard) instead.
 */
import { existsSync, readFileSync } from 'node:fs';

const page = 'public/ugc/index.html';

if (!existsSync(page)) {
  console.log('check-ugc-demo: no public/ugc build present, nothing to check.');
  process.exit(0);
}

const html = readFileSync(page, 'utf8');
const problems = [];
if (/name="ugc-demo-content"\s+content="true"/.test(html)) {
  problems.push('it is a DEMO build (meta ugc-demo-content=true)');
}
if (html.includes('❗ ')) {
  problems.push('it still contains FILL_IN placeholders');
}

if (problems.length === 0) {
  console.log('check-ugc-demo: public/ugc is a production build.');
  process.exit(0);
}

const bar = '─'.repeat(70);
const context = process.env.CONTEXT ?? 'local';
const production = context === 'production';

console[production ? 'error' : 'warn'](
  `\n${bar}\n  public/ugc/index.html is NOT publishable (${context} build) —`,
);
for (const p of problems) console[production ? 'error' : 'warn'](`    • ${p}`);

if (!production) {
  console.warn(`\n  Allowed for a ${context} deploy so it can be reviewed. This must never`);
  console.warn(`  be merged to the production branch as-is.\n${bar}\n`);
  process.exit(0);
}

console.error(`\n  Production deploy refused. Re-sync from the UGC repo without --preview`);
console.error(`  once content.ts is real, or remove public/ugc/ to ship the main site alone.\n${bar}\n`);
process.exit(1);
