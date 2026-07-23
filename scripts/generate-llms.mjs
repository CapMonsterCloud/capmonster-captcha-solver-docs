#!/usr/bin/env node
/**
 * scripts/generate-llms.mjs
 *
 * Generates static/llms.txt and static/llms-full.txt from Docusaurus MDX content.
 * Tailored for the CapMonsterCloud/docs repo structure (Docusaurus 3, MDX, i18n).
 *
 * Usage:
 *   node scripts/generate-llms.mjs                  # English (default)
 *   node scripts/generate-llms.mjs --locale=ru
 *   node scripts/generate-llms.mjs --verbose
 *   node scripts/generate-llms.mjs --out=tmp/       # custom output dir
 *   node scripts/generate-llms.mjs --help
 *
 * Run before `yarn build` to include files in the deployed site.
 * Zero dependencies - uses only Node 20+ stdlib.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

// --- CONFIG -----------------------------------------------------------

const SITE_URL = 'https://docs.capmonster.cloud';
const PRODUCT_NAME = 'CapMonster Cloud';
const TAGLINE =
  'Cloud captcha solving API. Send captcha parameters via createTask, ' +
  'poll getTaskResult, receive a solution token. Supports reCAPTCHA v2/v3, ' +
  'Turnstile, GeeTest, Cloudflare Challenge, and 20+ other types.';

// Locale-specific paths (matches your repo layout)
const LOCALES = {
  en: {
    docsDir: 'i18n/en/docusaurus-plugin-content-docs/current',
    urlPrefix: '/docs',
  },
  ru: {
    docsDir: 'docs',
    urlPrefix: '/ru/docs',
  },
};

// Category metadata - controls grouping and order in llms.txt.
// Keys match the top-level directory names in your docs tree.
// Add/edit as your tree evolves.
const CATEGORY_META = {
  overview:            { label: 'Getting started',  order: 1 },
  'getting-start':     { label: 'Getting started',  order: 2 },
  api:                 { label: 'API Reference',    order: 3 },
  methods:             { label: 'API Reference',    order: 4 },
  captchas:            { label: 'Captcha types',    order: 5 },
  'external-services': { label: 'Integrations',     order: 6 },
  extension:           { label: 'Browser extension',order: 7 },
  news:                { label: 'Updates',          order: 8 },
  faq:                 { label: 'Optional',         order: 90 },
};

// Skip these paths entirely
const EXCLUDE_PATTERNS = [
  /(^|\/)_/,              // hidden files/folders (e.g. _category_.json)
  /node_modules/,
];

// --- CLI --------------------------------------------------------------

const { values } = parseArgs({
  options: {
    locale:     { type: 'string',  default: 'en' },
    out:        { type: 'string',  default: 'static' },
    'site-url': { type: 'string',  default: SITE_URL },
    verbose:    { type: 'boolean', default: false },
    help:       { type: 'boolean', short: 'h', default: false },
  },
});

if (values.help) {
  console.log(`
Generate llms.txt and llms-full.txt from Docusaurus docs.

Options:
  --locale=<en|ru>      Locale to dump (default: en)
  --out=<dir>           Output directory (default: static)
  --site-url=<url>      Override site URL
  --verbose             Print each processed file
  --help                Show this help
`);
  process.exit(0);
}

const cfg = LOCALES[values.locale];
if (!cfg) {
  console.error(`Unknown locale: ${values.locale}. Use 'en' or 'ru'.`);
  process.exit(1);
}

const siteUrl = values['site-url'].replace(/\/$/, '');
const log = (msg) => values.verbose && console.log(msg);

// --- FRONTMATTER PARSING ----------------------------------------------

/** Tiny YAML frontmatter parser (handles strings, numbers, booleans). */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { data: {}, content: raw };

  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;

    let value = kv[2].trim();
    if (value === '') continue;

    // Strip quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Coerce types
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (/^-?\d+(\.\d+)?$/.test(value)) value = Number(value);

    data[kv[1]] = value;
  }
  return { data, content: m[2] };
}

// --- MDX -> MARKDOWN --------------------------------------------------

/** Strip MDX-specific syntax, keep readable markdown for an LLM. */
function mdxToMarkdown(content) {
  // --- Protect code blocks from being touched by other regexes -------
  const stash = [];
  const STASH = (s) => {
    const i = stash.push(s) - 1;
    return `\x00STASH_${i}\x00`;
  };

  let result = content;
  result = result.replace(/```[\s\S]*?```/g, (m) => STASH(m));  // fenced
  result = result.replace(/`[^`\n]+`/g, (m) => STASH(m));       // inline

  // 1. Remove import/export statements at line start
  result = result.replace(/^import\s+[^;\n]+;?\s*$/gm, '');
  result = result.replace(/^export\s+(?:const|let|var|default|function|\{)[\s\S]*?(?=^[#\w<>\n]|$)/gm, '');

  // 2. <ParamItem title="X" required type="Y" /> -> **X** (Y, required):
  //    Must run before generic self-closing JSX strip so we keep the metadata.
  result = result.replace(
    /<ParamItem\b([^>]*?)\/>/g,
    (_, attrs) => {
      const title   = (attrs.match(/\btitle=["']([^"']+)["']/)   || [])[1] || '';
      const type    = (attrs.match(/\btype=["']([^"']+)["']/)    || [])[1] || '';
      const req     = /\brequired\b/.test(attrs);
      if (!title) return '';
      const meta = [type, req ? 'required' : ''].filter(Boolean).join(', ');
      return `**${title}**${meta ? ` (${meta})` : ''}:`;
    }
  );

  // 3. Docusaurus admonitions -> blockquotes
  // Use [ \t]+ (not \s+) so a bare newline after :::type is not treated as a title.
  // Allow optional leading whitespace before the closing ::: (some files indent it).
  result = result.replace(
    /:::([a-z]+)(?:[ \t]+([^\n]+))?[ \t]*\n([\s\S]*?)\n[ \t]*:::/g,
    (_, type, title, body) => {
      const rawLabel = title ? title.replace(/[*_`]/g, '').trim() : type;
      const cap = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
      const quoted = body.trim().split('\n').map((l) => `> ${l}`).join('\n');
      return `> **${cap}**\n>\n${quoted}`;
    }
  );
  // Drop any leftover ::: markers (e.g. from nested or malformed admonitions)
  result = result.replace(/^[ \t]*:::.*$/gm, '');

  // 4. <Tabs>/<TabItem> -> #### headings
  result = result.replace(
    /<TabItem[^>]*\blabel=["']([^"']+)["'][^>]*>([\s\S]*?)<\/TabItem>/g,
    (_, label, body) => `\n#### ${label.trim()}\n\n${body.trim()}\n`
  );
  result = result.replace(/<\/?Tabs[^>]*>/g, '');

  // 5. <details><summary>X</summary>Y</details> -> #### X\nY
  result = result.replace(
    /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g,
    (_, summary, body) => `\n#### ${summary.trim()}\n\n${body.trim()}\n`
  );

  // 6. HTML block elements -> convert to readable text, don't drop content
  //    <br> / <br /> -> newline
  result = result.replace(/<br\s*\/?>/gi, '\n');
  //    <p>...</p> -> content + newline
  result = result.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => inner.trim() + '\n');
  //    <div>...</div> -> content (strip wrapper)
  result = result.replace(/<div\b[^>]*>([\s\S]*?)<\/div>/gi, (_, inner) => inner.trim() + '\n');
  //    HTML tables -> flat text (extract cell text, one row per line)
  result = result.replace(/<table[\s\S]*?<\/table>/gi, (table) => {
    const rows = [];
    const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowM;
    while ((rowM = rowRe.exec(table)) !== null) {
      const cellRe = /<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells = [];
      let cellM;
      while ((cellM = cellRe.exec(rowM[1])) !== null) {
        const text = cellM[1].replace(/<[^>]+>/g, '').trim();
        if (text) cells.push(text);
      }
      if (cells.length) rows.push(cells.join(' | '));
    }
    return rows.join('\n') + '\n';
  });
  //    <li> -> markdown list item
  result = result.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => `- ${inner.trim()}\n`);
  result = result.replace(/<\/?(ul|ol)\b[^>]*>/gi, '\n');
  //    <strong>/<b> -> **bold**
  result = result.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (_, inner) => `**${inner.trim()}**`);
  //    <em>/<i> -> *italic*
  result = result.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, (_, inner) => `*${inner.trim()}*`);
  //    <a href="..."> -> [text](href)
  result = result.replace(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => `[${text.trim()}](${href})`);
  //    Remaining inline HTML tags -> strip tags, keep content
  result = result.replace(/<[a-z][^>]*\/?>/gi, '');
  result = result.replace(/<\/[a-z][^>]*>/gi, '');

  // 7. Other JSX components (capitalized tags) -> strip wrapper, keep inner content
  result = result.replace(/<[A-Z][\w.]*\s*[^>]*\/>/g, '');
  let prev;
  do {
    prev = result;
    result = result.replace(/<([A-Z][\w.]*)\b[^>]*>([\s\S]*?)<\/\1>/g, '$2');
  } while (result !== prev);

  // 8. MDX comments {/* ... */} and HTML comments
  result = result.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  result = result.replace(/<!--[\s\S]*?-->/g, '');

  // 9. Standalone JSX expressions on their own line -> best effort
  result = result.replace(/^\s*\{[^{}\n]+\}\s*$/gm, '');

  // 10. Strip all images - LLMs cannot see them and paths are meaningless in plain text
  result = result.replace(/!\[[^\]]*\]\([^)]*\)\s*/g, '');

  // 11. Collapse excess blank lines
  result = result.replace(/\n{3,}/g, '\n\n');

  // --- Restore stashed code blocks ----------------------------------
  result = result.replace(/\x00STASH_(\d+)\x00/g, (_, i) => stash[Number(i)]);

  return result.trim();
}

function extractH1(content) {
  const m = content.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

function firstParagraph(content) {
  const cleaned = content
    .replace(/```[\s\S]*?```/g, '')          // fenced code blocks
    .replace(/`[^`\n]+`/g, '')               // inline code
    .replace(/^#{1,6}\s+.+$/gm, '')          // headings
    .replace(/^>\s+.*$/gm, '')               // blockquotes
    .replace(/^\s*[-*+]\s+.*$/gm, '')        // lists
    .replace(/^\|.*\|.*$/gm, '')             // markdown tables
    .replace(/!\[.*?\]\(.*?\)/g, '')         // markdown images
    .replace(/<[^>]+>/g, '')                 // HTML/JSX tags
    .replace(/^import\s+.*$/gm, '')          // leftover imports (BOM safety net)
    .replace(/^---.*$/gm, '')                // frontmatter delimiters (BOM safety net)
    .replace(/^[a-z_][\w-]*\s*:.*$/gm, '')  // frontmatter key:value lines (BOM safety net)
    .replace(/[*_]{1,2}([^*_\n]+)[*_]{1,2}/g, '$1') // bold/italic markers
    .replace(/\n{2,}/g, '\n');
  const m = cleaned.match(/^([^\n]{20,})$/m);
  if (!m) return '';
  return m[1].trim().replace(/\s+/g, ' ').slice(0, 200);
}

function humanize(s) {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Rewrite internal doc links so they point to .txt files:
 *   - absolute  https://docs.capmonster.cloud/docs/path/ -> .../path.txt
 *   - relative  ../foo.mdx, ./bar, api/methods/baz.mdx   -> resolved absolute .txt URL
 *
 * Uses the source file path (not the published URL) for correct relative resolution.
 */
function fixDocLinks(content, siteUrl, urlPrefix, sourceFileRel) {
  // Treat the source file as a "virtual file" at its published URL path (no trailing slash).
  // e.g. "api/methods/create-task.mdx" -> base = "https://.../docs/api/methods/create-task"
  // This makes URL resolution behave like the file system (sibling = same directory).
  const fileNoExt = sourceFileRel.replace(/\.[^/.]+$/, '');
  const base = `${siteUrl}${urlPrefix}/${fileNoExt}`;

  const NON_DOC_EXT = /\.(js|ts|json|css|png|jpg|gif|svg|zip|pdf|crx|mdx)$/i;

  // 1. Absolute capmonster doc links (trailing slash -> .txt)
  content = content.replace(
    /\]\((https:\/\/docs\.capmonster\.cloud\/docs\/[^)#\s]*?)\/?(\#[^)]*?)?\)/g,
    (_, href, anchor = '') => `](${href.replace(/\/+$/, '')}.txt${anchor})`
  );

  // 2. Relative links -> two sub-passes:
  //    a) links with .mdx extension (any relative path)
  //    b) dot-relative links without extension  (e.g. ./../captchas/no-captcha-task)
  const docsBase = `${siteUrl}${urlPrefix}`;
  const resolveRel = (match, rel, anchor = '') => {
    try {
      let resolved = new URL(rel, base).href
        .replace(/\.mdx$/, '')
        .replace(/\/+$/, '');
      if (!resolved.startsWith(siteUrl)) return match;
      // Clamp: if relative traversal escaped the /docs prefix, re-anchor it.
      if (!resolved.startsWith(docsBase)) {
        const tail = resolved.slice(siteUrl.length); // e.g. "/captchas/foo"
        resolved = `${docsBase}${tail}`;
      }
      return `](${resolved}.txt${anchor})`;
    } catch {
      return match;
    }
  };

  content = content.replace(/\]\(([^)#\s][^)]*?\.mdx)(\#[^)]*?)?\)/g, resolveRel);

  // dot-relative paths with no extension (must start with . to avoid matching bare words)
  content = content.replace(
    /\]\((\.\.?\/[^)#\s]*?[^.)\s])(\#[^)]*?)?\)/g,
    (match, rel, anchor = '') => {
      if (/\.(js|ts|json|css|png|jpg|gif|svg|zip|pdf|crx|txt)$/i.test(rel)) return match;
      return resolveRel(match, rel, anchor);
    }
  );

  return content;
}

// --- FILE WALK --------------------------------------------------------

async function walkDocs(rootDir) {
  const results = [];

  async function recurse(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(rootDir, full).replace(/\\/g, '/');

      if (EXCLUDE_PATTERNS.some((p) => p.test(rel))) continue;

      if (entry.isDirectory()) {
        await recurse(full);
      } else if (/\.(md|mdx)$/i.test(entry.name)) {
        results.push(full);
      }
    }
  }

  await recurse(rootDir);
  return results;
}

// --- URL CONSTRUCTION -------------------------------------------------

function buildUrl(filePath, rootDir, frontmatter) {
  const rel = path
    .relative(rootDir, filePath)
    .replace(/\\/g, '/')
    .replace(/\.(md|mdx)$/i, '');

  // Honor explicit slug from frontmatter
  if (frontmatter.slug) {
    const slug = String(frontmatter.slug).replace(/^\/+|\/+$/g, '');
    return `${siteUrl}${cfg.urlPrefix}/${slug}/`;
  }

  // "foo/index" -> "foo"
  const cleaned = rel.replace(/\/index$/i, '').replace(/^index$/i, '');
  const tail = cleaned ? `/${cleaned}/` : '/';
  return `${siteUrl}${cfg.urlPrefix}${tail}`;
}

function getCategory(filePath, rootDir) {
  const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const top = rel.split('/')[0].replace(/\.(md|mdx)$/i, '');
  const meta = CATEGORY_META[top];
  return meta
    ? { key: top, label: meta.label, order: meta.order }
    : { key: top, label: humanize(top), order: 50 };
}

// --- MAIN -------------------------------------------------------------

async function main() {
  const rootDir = path.resolve(cfg.docsDir);
  console.log(`Reading docs from: ${path.relative(process.cwd(), rootDir) || '.'}`);

  try {
    await fs.access(rootDir);
  } catch {
    console.error(`ERROR: Directory not found: ${rootDir}`);
    console.error(`   Run this script from the repo root.`);
    process.exit(1);
  }

  const files = await walkDocs(rootDir);
  console.log(`Found ${files.length} MDX/MD files`);

  const pages = [];
  for (const file of files) {
    try {
      const raw = (await fs.readFile(file, 'utf-8')).replace(/^\uFEFF/, '');
      const { data: frontmatter, content } = parseFrontmatter(raw);

      if (frontmatter.draft === true) {
        log(`   skip (draft):  ${path.relative(rootDir, file)}`);
        continue;
      }

      const markdown = mdxToMarkdown(content);
      const baseName = path.basename(file, path.extname(file));
      const title =
        frontmatter.title ||
        extractH1(markdown) ||
        frontmatter.sidebar_label ||
        humanize(baseName);
      const description = frontmatter.description || firstParagraph(markdown);
      const url = buildUrl(file, rootDir, frontmatter);
      const cat = getCategory(file, rootDir);
      const position =
        typeof frontmatter.sidebar_position === 'number'
          ? frontmatter.sidebar_position
          : 999;

      pages.push({
        file: path.relative(rootDir, file),
        url, title, description,
        category: cat, position,
        content: fixDocLinks(markdown, siteUrl, cfg.urlPrefix, path.relative(rootDir, file).replace(/\\/g, '/')),
      });

      log(`   ok ${path.relative(rootDir, file)}`);
    } catch (e) {
      console.error(`   WARN: Error processing ${file}: ${e.message}`);
    }
  }

  if (pages.length === 0) {
    console.error('\nERROR: No pages found! Aborting.');
    process.exit(1);
  }

  // Sort: category order -> sidebar_position -> title
  pages.sort(
    (a, b) =>
      a.category.order - b.category.order ||
      a.position - b.position ||
      a.title.localeCompare(b.title)
  );

  console.log(`Processed ${pages.length} pages`);

  // --- llms.txt ------------------------------------------------------
  const groups = new Map();
  for (const p of pages) {
    if (!groups.has(p.category.label)) groups.set(p.category.label, []);
    groups.get(p.category.label).push(p);
  }

  const llmsTxt =
    [
      `# ${PRODUCT_NAME}`,
      '',
      `> ${TAGLINE}`,
      '',
      `Documentation site: ${siteUrl}/`,
      `Full text dump: ${siteUrl}/llms-full.txt`,
      '',
      ...[...groups.entries()].flatMap(([label, items]) => [
        `## ${label}`,
        '',
        ...items.map((p) => {
          const txtUrl = p.url.replace(/\/+$/, '') + '.txt';
          const desc = p.description ? `: ${p.description}` : '';
          return `- [${p.title}](${txtUrl})${desc}`;
        }),
        '',
      ]),
    ].join('\n') + '\n';

  // --- llms-full.txt -------------------------------------------------
  const SEP = '='.repeat(72);
  const llmsFull =
    [
      `# ${PRODUCT_NAME} - Full Documentation`,
      `Generated: ${new Date().toISOString()}`,
      `Locale: ${values.locale}`,
      `Pages: ${pages.length}`,
      '',
      `> ${TAGLINE}`,
      '',
      ...pages.flatMap((p) => [
        SEP,
        `URL: ${p.url.replace(/\/+$/, '')}.txt`,
        `Title: ${p.title}`,
        `Source: ${p.file}`,
        SEP,
        '',
        p.content,
        '',
        '',
      ]),
    ].join('\n') + '\n';

  // --- WRITE ---------------------------------------------------------
  const outDir = path.resolve(values.out);
  await fs.mkdir(outDir, { recursive: true });

  const llmsPath = path.join(outDir, 'llms.txt');
  const fullPath = path.join(outDir, 'llms-full.txt');

  await fs.writeFile(llmsPath, llmsTxt, 'utf-8');
  await fs.writeFile(fullPath, llmsFull, 'utf-8');

  // --- PER-PAGE .txt FILES -------------------------------------------
  // Each page gets its own file mirroring the URL path so LLMs can
  // fetch e.g. /docs/api/methods/create-task.txt directly.
  let pageFilesWritten = 0;
  for (const p of pages) {
    // Strip base URL and trailing slash -> "/docs/api/methods/create-task"
    const urlPath = p.url
      .replace(siteUrl, '')
      .replace(/\/+$/, '');
    const filePath = path.join(outDir, urlPath + '.txt');
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const pageContent = [
      `# ${p.title}`,
      '',
      `URL: ${p.url}`,
      ...(p.description ? [`> ${p.description}`, ''] : []),
      '',
      p.content,
      '',
    ].join('\n');
    await fs.writeFile(filePath, pageContent, 'utf-8');
    pageFilesWritten++;
  }

  // --- SUMMARY -------------------------------------------------------
  console.log('');
  console.log(`OK ${path.relative(process.cwd(), llmsPath).padEnd(36)} ${fmtSize(llmsTxt.length)}`);
  console.log(`OK ${path.relative(process.cwd(), fullPath).padEnd(36)} ${fmtSize(llmsFull.length)}`);
  console.log(`OK ${pageFilesWritten} individual page .txt files written`);
  console.log('');
  console.log(`Categories: ${[...groups.keys()].join(', ')}`);

  // --- SANITY CHECKS -------------------------------------------------
  const warnings = [];
  if (llmsTxt.length > 50_000)
    warnings.push(`llms.txt is large (>50KB) - consider trimming descriptions`);
  if (llmsFull.length > 2_000_000)
    warnings.push(`llms-full.txt is very large (>2MB) - some agents may have trouble`);
  if (llmsFull.length < 10_000)
    warnings.push(`llms-full.txt suspiciously small (<10KB) - verify pages are parsed`);

  if (warnings.length) {
    console.log('');
    warnings.forEach((w) => console.log(`WARN: ${w}`));
  }
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
