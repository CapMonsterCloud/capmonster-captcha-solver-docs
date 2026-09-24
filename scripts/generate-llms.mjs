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

// Public prices endpoint used by src/hooks/useFetchPrices.ts. Fetched once
// at build time so <PriceBlock/> can be rendered as text. If the request
// fails, the price line is simply omitted - the build never fails on it.
const PRICES_URL = 'https://dash.capmonster.cloud/api/prices?all=true';
const PRICES_TIMEOUT_MS = 10_000;

// Text for React components that carry content but have no MDX body.
// Keep in sync with:
//   src/components/McpNotice/index.js      (mcpTitle / mcpText / mcpLink)
//   src/locales/<locale>.json              (moreBlogInfo, hundred* strings)
const COMPONENT_TEXT = {
  en: {
    mcpTitle: 'CapMonster Cloud MCP',
    mcpText: 'CapMonster Cloud MCP can also be used to detect and solve CAPTCHA.',
    mcpLink: 'Learn more about MCP',
    moreBlogInfo: 'More on the topic in our blog',
    fullPriceText: 'View full price',
    pricesPageUrl: 'https://capmonster.cloud/en/prices/',
    price: 'Price',
    successRate: 'Success rate',
    resultType: {
      token: '1000 tokens',
      image: '1000 images',
      dynamic: '1000 dynamic images',
      answers: '1000 answers',
    },
  },
  ru: {
    mcpTitle: 'CapMonster Cloud MCP',
    mcpText: 'Для распознавания и решения CAPTCHA также можно использовать CapMonster Cloud MCP.',
    mcpLink: 'Подробнее о работе с MCP',
    moreBlogInfo: 'Ещё больше по теме в нашем блоге',
    fullPriceText: 'Посмотреть полный прайс',
    pricesPageUrl: 'https://capmonster.cloud/ru/prices/',
    price: 'Цена',
    successRate: 'Успешность',
    resultType: {
      token: '1000 токенов',
      image: '1000 картинок',
      dynamic: '1000 дин. картинок',
      answers: '1000 ответов',
    },
  },
};

// --- CLI --------------------------------------------------------------

const { values } = parseArgs({
  options: {
    locale:     { type: 'string',  default: 'en' },
    out:        { type: 'string',  default: 'static' },
    'site-url': { type: 'string',  default: SITE_URL },
    'no-prices': { type: 'boolean', default: false },
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
  --no-prices           Do not fetch prices for <PriceBlock/> (offline / deterministic output)
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

/**
 * Strip MDX-specific syntax, keep readable markdown for an LLM.
 *
 * `ctx` carries what is needed to render content-bearing React components
 * as text: { text: COMPONENT_TEXT[locale], prices: Map<id, item>|null,
 *            mcpUrl: absolute page URL of the MCP doc (fixDocLinks turns it into .txt) }.
 */
function mdxToMarkdown(content, ctx) {
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

  // 2b. <McpNotice /> -> tip admonition (mirrors src/components/McpNotice).
  //     Rendered as markdown here so step 3 turns it into a blockquote.
  result = result.replace(/<McpNotice\b[^>]*\/>/g, () => {
    const t = ctx.text;
    return `\n:::tip ${t.mcpTitle}\n${t.mcpText} [${t.mcpLink}](${ctx.mcpUrl}).\n:::\n`;
  });

  // 2c. <PriceBlock title="X" captchaId="x" /> -> "X - Price: $N / 1000 tokens. Success rate: N%."
  //     The label is title ?? item.Name, like the component. Omitted when prices
  //     could not be fetched (or --no-prices).
  result = result.replace(/<PriceBlock\b([^>]*?)\/>/g, (_, attrs) => {
    if (!ctx.prices) return '';
    const id = (attrs.match(/\bcaptchaId=["']([^"']+)["']/) || [])[1];
    const item = id && ctx.prices.get(id);
    if (!item) return '';
    const t = ctx.text;
    const label = (attrs.match(/\btitle=["']([^"']+)["']/) || [])[1] || item.Name || id;
    const unit = t.resultType[item.ResultType] || t.resultType.token;
    const parts = [`**${t.price}:** $${item.Price} / ${unit}`];
    if (typeof item.SuccessRate === 'number') parts.push(`**${t.successRate}:** ${item.SuccessRate}%`);
    return `\n${label} - ${parts.join('. ')}.\n`;
  });
  //     <PriceBlockWrap> adds a "View full price" link above the blocks.
  result = result.replace(
    /<PriceBlockWrap\b[^>]*>([\s\S]*?)<\/PriceBlockWrap>/g,
    (_, inner) => `\n${ctx.text.fullPriceText}: ${ctx.text.pricesPageUrl}\n${inner}\n`
  );

  // 2d. <BlogLink url="..." /> -> "More on the topic in our blog: <url>"
  result = result.replace(/<BlogLink\b([^>]*?)\/>/g, (_, attrs) => {
    const url = (attrs.match(/\burl=["']([^"']+)["']/) || [])[1];
    if (!url) return '';
    const title = (attrs.match(/\btitle=["']([^"']+)["']/) || [])[1];
    return `\n${ctx.text.moreBlogInfo}: ${title ? `[${title}](${url})` : url}\n`;
  });

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

// Lines produced by the component renderers above must never become a page
// description in llms.txt - skip them in firstParagraph().
const COMPONENT_LINE_RE = (() => {
  const all = Object.values(COMPONENT_TEXT);
  const alt = (pick) => all.map((t) => pick(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(
    `^(?:.*\\*\\*(?:${alt((t) => t.price)}):\\*\\*.*|(?:${alt((t) => t.moreBlogInfo)}|${alt((t) => t.fullPriceText)}):.*)$`,
    'gm'
  );
})();

function firstParagraph(content) {
  const cleaned = content
    .replace(COMPONENT_LINE_RE, '')          // price / blog-link lines from components
    .replace(/^\s*\d+\.\s+.*$/gm, '')        // numbered lists
    .replace(/```[\s\S]*?```/g, '')          // fenced code blocks
    .replace(/`([^`\n]+)`/g, '$1')           // inline code -> keep its text
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
function fixDocLinks(content, { siteUrl, urlPrefix, sourceFileRel, pageUrl, knownUrls }) {
  const docsBase = `${siteUrl}${urlPrefix}`;
  // Source file as a "virtual file" at its URL path (no trailing slash), so that
  // links to .mdx files resolve like the file system (sibling = same directory).
  const fileBase = `${docsBase}/${sourceFileRel.replace(/\.[^/.]+$/, '')}`;
  const SKIP_EXT = /\.(js|ts|json|css|png|jpe?g|gif|svg|zip|pdf|crx|txt)$/i;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Canonical page URL -> ".txt" only when we generate that page. Category
  // (generated-index) pages have no .txt, so they keep their page URL.
  const toTarget = (absNoSlash, anchor) => {
    const page = `${absNoSlash}/`;
    return knownUrls.has(page) ? `${absNoSlash}.txt${anchor}` : `${page}${anchor}`;
  };

  // Resolve `rel` against `base`, clamp into this locale's docs prefix and return
  // the absolute URL without trailing slash (or null if it leaves the site).
  const resolve = (rel, base, isSourceFile) => {
    try {
      let abs = new URL(rel, base).href.split('?')[0].replace(/\.mdx?$/i, '').replace(/\/+$/, '');
      if (!abs.startsWith(siteUrl)) return null;
      if (!abs.startsWith(docsBase)) abs = `${docsBase}${abs.slice(siteUrl.length)}`; // escaped the prefix
      let relPath = abs.slice(docsBase.length).replace(/^\/+/, '');
      if (isSourceFile) relPath = collapseCategoryIndex(relPath); // foo/foo.mdx -> /foo/
      return relPath ? `${docsBase}/${relPath}` : docsBase;
    } catch {
      return null;
    }
  };

  // 1. Absolute links into this locale's docs (https://docs.capmonster.cloud/docs/...)
  content = content.replace(
    new RegExp(`\\]\\((${esc(docsBase)}(?:/[^)#\\s]*)?)(#[^)]*)?\\)`, 'g'),
    (m, href, anchor = '') => {
      if (SKIP_EXT.test(href)) return m;
      const r = resolve(href, `${docsBase}/`, false);
      return r ? `](${toTarget(r, anchor)})` : m;
    }
  );

  // 2. Relative links to source files (.md/.mdx): relative to the source file.
  content = content.replace(/\]\(([^)#\s][^)]*?\.mdx?)(#[^)]*)?\)/gi, (m, rel, anchor = '') => {
    const r = resolve(rel, fileBase, true);
    return r ? `](${toTarget(r, anchor)})` : m;
  });

  // 3. Dot-relative links without extension (e.g. ../recaptcha-v3-task/): the browser
  //    resolves these against the page URL, which ends with a slash - so do we.
  content = content.replace(/\]\((\.\.?\/[^)#\s]*?[^.)\s])(#[^)]*)?\)/g, (m, rel, anchor = '') => {
    if (SKIP_EXT.test(rel)) return m;
    const r = resolve(rel, pageUrl, false);
    return r ? `](${toTarget(r, anchor)})` : m;
  });

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

  // Docusaurus "category index" convention: foo/index.md, foo/README.md and
  // foo/foo.md all become the URL of the folder itself (/foo/), not /foo/foo/.
  // Without this the .txt for e.g. mcp/mcp.mdx would live at /docs/mcp/mcp.txt
  // while the page is served at /docs/mcp/.
  const cleaned = collapseCategoryIndex(rel);
  const tail = cleaned ? `/${cleaned}/` : '/';
  return `${siteUrl}${cfg.urlPrefix}${tail}`;
}

/** "foo/index" | "foo/README" | "foo/foo" -> "foo"; "index" -> "" */
function collapseCategoryIndex(relNoExt) {
  const parts = relNoExt.split('/');
  const last = parts[parts.length - 1];
  const parent = parts.length > 1 ? parts[parts.length - 2] : null;
  // Docusaurus compares folder and file names case-insensitively.
  if (/^(index|readme)$/i.test(last) || (parent !== null && last.toLowerCase() === parent.toLowerCase())) {
    parts.pop();
  }
  return parts.join('/');
}

function getCategory(filePath, rootDir) {
  const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const top = rel.split('/')[0].replace(/\.(md|mdx)$/i, '');
  const meta = CATEGORY_META[top];
  return meta
    ? { key: top, label: meta.label, order: meta.order }
    : { key: top, label: humanize(top), order: 50 };
}

// --- PRICES -----------------------------------------------------------

/**
 * Fetch the public price list once (same endpoint the site uses at runtime).
 * Returns Map<captchaId, item> or null on any failure - never throws, so a
 * hiccup on the prices API cannot break the documentation build.
 */
async function fetchPrices() {
  try {
    const res = await fetch(PRICES_URL, { signal: AbortSignal.timeout(PRICES_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data?.PricesV2) ? data.PricesV2 : [];
    if (items.length === 0) throw new Error('empty PricesV2');
    const map = new Map(items.filter((i) => i && i.Id).map((i) => [i.Id, i]));
    console.log(`Fetched prices for ${map.size} captcha types`);
    return map;
  } catch (e) {
    console.log(`WARN: prices unavailable (${e.message}); <PriceBlock/> will be omitted from txt`);
    return null;
  }
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

  const ctx = {
    text: COMPONENT_TEXT[values.locale] || COMPONENT_TEXT.en,
    prices: values['no-prices'] ? null : await fetchPrices(),
    // page URL on purpose: fixDocLinks() rewrites it to the .txt URL like any other doc link
    mcpUrl: `${siteUrl}${cfg.urlPrefix}/mcp/`,
  };

  const pages = [];
  for (const file of files) {
    try {
      // Strip BOM and normalise CRLF so output is identical on Windows and Linux builds.
      const raw = (await fs.readFile(file, 'utf-8')).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
      const { data: frontmatter, content } = parseFrontmatter(raw);

      if (frontmatter.draft === true) {
        log(`   skip (draft):  ${path.relative(rootDir, file)}`);
        continue;
      }

      const markdown = mdxToMarkdown(content, ctx);
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
        file: path.relative(rootDir, file).replace(/\\/g, '/'),
        url, title, description,
        category: cat, position,
        markdown,
        content: null, // filled below, once every page URL is known
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

  // Second pass: rewrite internal links. Links to pages we generate point to
  // their .txt twin; links to anything else (category pages) stay as page URLs.
  const knownUrls = new Set(pages.map((p) => p.url));
  for (const p of pages) {
    p.content = fixDocLinks(p.markdown, {
      siteUrl,
      urlPrefix: cfg.urlPrefix,
      sourceFileRel: p.file,
      pageUrl: p.url,
      knownUrls,
    });
    delete p.markdown;
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
