// Leonida Ledger — gta6-trophy-guide-02 entry program (Node 22, stdlib only).
//
// The guide itself is plain static files under app/: index.html, css/theme.css,
// js/boot.js, js/store.js, js/filters.js, js/views.js and data/trophies.json.
// A browser opens app/index.html and the whole guide works with the network
// off, so there is no build step and nothing to install. This program only
// hands the entry in: it copies app/ and screenshots/ from this repository
// into the output directory and writes output/dossier.json, the summary the
// judge reads, using the vendored make.fun library in
// vendor/makefun-frontend.ts. That vendored file is the kit's copy, unchanged;
// the scorer rebuilds the dossier with its own copy and requires the two to
// match byte for byte. POST.json is not copied: the house reads it from the
// repository at the submitted commit.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// It runs twice in grading and both runs must write identical bytes, so it
// writes nothing time-dependent and copies files in a fixed order.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsDir = join(outputDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
}

// The caps mirror the scorer's own limits (see the kit's RULES.txt):
// at most 4 screenshots, each at most 256 KiB; app/ at most 993 files and
// directories and 48 MiB in all. text_max_bytes caps the dossier text the
// judge's outline is built from.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
