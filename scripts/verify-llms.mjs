#!/usr/bin/env node
/**
 * scripts/verify-llms.mjs
 *
 * Post-build check that the LLM text files (llms.txt, llms-full.txt and the
 * per-page /docs/**.txt files) are present in the built site and in sync with
 * the HTML pages. Run after `npm run build`:
 *
 *   node scripts/verify-llms.mjs                # checks ./build for locale en
 *   node scripts/verify-llms.mjs --build=dist   # custom build dir
 *
 * Exits 1 with a list of problems when something is off. Zero dependencies.
 *
 * Checks:
 *   1. llms.txt and llms-full.txt exist in the build output and are not tiny.
 *   2. Every .txt link in llms.txt points to a file that exists in the build.
 *   3. Every per-page .txt has a "URL:" header whose page exists in the build
 *      (catches URL-mapping bugs such as /docs/mcp/mcp/ vs /docs/mcp/).
 *   4. The number of per-page .txt files equals the number of publishable
 *      source docs (non-draft .md/.mdx outside "_" folders).
 *   5. No per-page .txt still contains raw MDX: import lines, unstripped JSX
 *      components, admonition markers or MDX comments.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

const SITE_URL = 'https://docs.capmonster.cloud';
const LOCALES = {
  en: { docsDir: 'i18n/en/docusaurus-plugin-content-docs/current', urlPrefix: '/docs' },
  ru: { docsDir: 'docs', urlPrefix: '/ru/docs' },
};

const { values } = parseArgs({
  options: {
    build:  { type: 'string', default: 'build' },
    locale: { type: 'string', default: 'en' },
  },
});

const cfg = LOCALES[values.locale];
if (!cfg) {
  console.error(`Unknown locale: ${values.locale}`);
  process.exit(1);
}

const buildDir = path.resolve(values.build);
const problems = [];
const warnings = [];
const fail = (msg) => problems.push(msg);
const warn = (msg) => warnings.push(msg);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Markdown links into this locale's docs: ](https://docs.capmonster.cloud/docs/...)
const DOC_LINK_RE = new RegExp(`\\]\\((${escapeRe(SITE_URL)}(${escapeRe(cfg.urlPrefix)}(?:/[^)#?\\s]*)?))(?:[#?][^)]*)?\\)`, 'g');
// A rendered <PriceBlock/> line, e.g. "$0.9 / 1000 tokens"
const PRICE_LINE_RE = /\$\d+(?:\.\d+)? \/ 1000 /;

/** Check that a doc link target exists in the build: foo.txt as a file, /foo/ as foo/index.html. */
async function checkDocLink(urlPath, where) {
  if (urlPath.endsWith('.txt')) {
    if (!(await exists(path.join(buildDir, urlPath)))) fail(`${where}: links to ${urlPath} but that file is not in the build`);
    return;
  }
  const html = path.join(buildDir, urlPath.replace(/\/+$/, ''), 'index.html');
  if (!(await exists(html))) fail(`${where}: links to page ${urlPath} which is not in the build`);
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function walk(dir, pred) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(full, pred));
    else if (pred(full)) out.push(full);
  }
  return out;
}

async function countSourceDocs(rootDir) {
  const files = await walk(rootDir, (f) => /\.(md|mdx)$/i.test(f));
  let n = 0;
  for (const f of files) {
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    if (/(^|\/)_/.test(rel)) continue;
    // Strip BOM like the generator does - 17 English sources carry one.
    const raw = (await fs.readFile(f, 'utf-8')).replace(/^﻿/, '');
    if (/^---\r?\n[\s\S]*?^draft:\s*true\s*$[\s\S]*?\r?\n---/m.test(raw)) continue;
    n++;
  }
  return n;
}

async function main() {
  if (!(await exists(buildDir))) {
    console.error(`Build directory not found: ${buildDir}. Run "npm run build" first.`);
    process.exit(1);
  }

  // 1. index files
  const llmsPath = path.join(buildDir, 'llms.txt');
  const fullPath = path.join(buildDir, 'llms-full.txt');
  for (const [p, min] of [[llmsPath, 2_000], [fullPath, 50_000]]) {
    if (!(await exists(p))) { fail(`missing ${path.relative(buildDir, p)}`); continue; }
    const size = (await fs.stat(p)).size;
    if (size < min) fail(`${path.relative(buildDir, p)} is suspiciously small (${size} B < ${min} B)`);
  }

  // 2. every link in llms.txt resolves to a built file
  let linked = 0;
  if (await exists(llmsPath)) {
    const llms = await fs.readFile(llmsPath, 'utf-8');
    for (const m of llms.matchAll(DOC_LINK_RE)) {
      linked++;
      if (!m[2].endsWith('.txt')) fail(`llms.txt links to a page URL instead of a .txt file: ${m[2]}`);
      await checkDocLink(m[2], 'llms.txt');
    }
    if (linked === 0) fail('llms.txt contains no .txt links');
  }

  // 3. each per-page txt maps to an existing HTML page
  const pagesDir = path.join(buildDir, cfg.urlPrefix.replace(/^\//, ''));
  const txtFiles = (await exists(pagesDir)) ? await walk(pagesDir, (f) => f.endsWith('.txt')) : [];
  if (txtFiles.length === 0) fail(`no per-page .txt files under ${path.relative(buildDir, pagesDir)}`);
  let bodyLinks = 0;
  let pagesWithPrice = 0;

  for (const f of txtFiles) {
    const rel = path.relative(buildDir, f).replace(/\\/g, '/');
    const txt = await fs.readFile(f, 'utf-8');

    const urlLine = txt.match(/^URL: (\S+)\s*$/m);
    if (!urlLine) { fail(`${rel}: no "URL:" header`); continue; }
    const url = urlLine[1];
    if (!url.startsWith(SITE_URL)) { fail(`${rel}: URL does not start with ${SITE_URL}: ${url}`); continue; }
    const urlPath = url.slice(SITE_URL.length).replace(/\/+$/, '');
    const html = path.join(buildDir, urlPath, 'index.html');
    if (!(await exists(html))) fail(`${rel}: header URL ${url} has no page in the build (expected ${urlPath}/index.html)`);

    // the txt should sit next to the page: /docs/foo/ -> /docs/foo.txt
    const expectedTxt = `${urlPath}.txt`.replace(/^\//, '');
    if (expectedTxt !== rel) fail(`${rel}: expected file name ${expectedTxt} for URL ${url}`);

    // 2b. in-body links into the docs must resolve (both .txt twins and page URLs)
    for (const m of txt.matchAll(DOC_LINK_RE)) {
      bodyLinks++;
      await checkDocLink(m[2], rel);
    }

    if (PRICE_LINE_RE.test(txt)) pagesWithPrice++;

    // 5. raw MDX leftovers
    const body = txt.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]+`/g, '');
    const leftovers = [
      [/^import\s+.+\s+from\s+['"]/m, 'import statement'],
      [/<[A-Z][A-Za-z.]*(\s[^>]*)?\/?>/, 'JSX component tag'],
      [/^[ \t]*:::/m, 'admonition marker'],
      [/\{\/\*[\s\S]*?\*\/\}/, 'MDX comment'],
    ];
    for (const [re, what] of leftovers) {
      const m = body.match(re);
      if (m) fail(`${rel}: raw MDX leftover (${what}): ${m[0].slice(0, 80).replace(/\s+/g, ' ')}`);
    }
  }

  // 4. count parity with source docs
  const srcCount = await countSourceDocs(path.resolve(cfg.docsDir));
  if (srcCount !== txtFiles.length)
    fail(`page count mismatch: ${srcCount} publishable source docs vs ${txtFiles.length} per-page .txt files`);

  // Prices are baked in at build time from a live endpoint. A hiccup there
  // must not fail the build, but it should not go unnoticed either.
  if (txtFiles.length && pagesWithPrice === 0)
    warn('no per-page .txt contains a price line - the prices API was probably unavailable during the build');

  // --- report
  console.log(
    `Checked ${txtFiles.length} per-page .txt files, ${linked} llms.txt links, ${bodyLinks} in-body links, ` +
    `${srcCount} source docs, ${pagesWithPrice} pages with prices`
  );
  for (const w of warnings) console.warn(`WARN: ${w}`);
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log('OK: LLM text files are present and in sync with the built pages');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
