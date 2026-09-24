# CapMonster Cloud API Documentation & CAPTCHA Solver Guides

<p align="center">
  <a href="https://capmonster.cloud/en/?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_read">
    <img src="https://img.shields.io/badge/CapMonster%20Cloud-Official%20Documentation-00B2FF?style=for-the-badge&logo=googledocs&logoColor=white" alt="CapMonster Cloud Docs" height="40">
  </a>
</p>

<p align="center">
  <strong>Comprehensive API documentation, integration guides, and code examples for CapMonster Cloud AI CAPTCHA solver.</strong>
</p>

<p align="center">
  <a href="https://docs.capmonster.cloud/docs/getting-start/?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_read"><img src="https://img.shields.io/badge/Docs-Hosted%20Live-brightgreen.svg?style=flat-square" alt="Documentation Status"></a>
  <a href="https://docusaurus.io/"><img src="https://img.shields.io/badge/Built%20with-Docusaurus%203-3ECC5F?style=flat-square&logo=docusaurus&logoColor=white" alt="Built with Docusaurus 3"></a>
  <a href="https://github.com/CapMonsterCloud/capmonster-captcha-solver-docs/stargazers"><img src="https://img.shields.io/github/stars/CapMonsterCloud/capmonster-captcha-solver-docs?style=flat-square&color=yellow" alt="GitHub Stars"></a>
  <a href="https://github.com/CapMonsterCloud/capmonster-captcha-solver-docs/network/members"><img src="https://img.shields.io/github/forks/CapMonsterCloud/capmonster-captcha-solver-docs?style=flat-square" alt="GitHub Forks"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-orange.svg?style=flat-square" alt="License: MIT"></a>
</p>

---

Welcome to the official documentation repository for **[CapMonster Cloud](https://capmonster.cloud/en/?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_read)** — the high-speed AI-powered CAPTCHA solving infrastructure for developers and automation engineers.

Here you will find full API specifications, payload samples, and step-by-step guides for bypassing **Cloudflare Turnstile, reCAPTCHA v2/v3/Enterprise, DataDome, GeeTest, and Amazon WAF**.

**[👉 Get your Free API Key & Free Trial Balance on CapMonster Cloud](https://dash.capmonster.cloud/Account/SignUp?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_read)**

---

## 📚 Documentation Navigation

Explore our live hosted documentation portal:

| Section | Description | Live Link |
| :--- | :--- | :--- |
| 🚀 **Getting Started** | Quickstart tutorial, account setup, and balance activation | [Read Guide](https://docs.capmonster.cloud/docs/getting-start/?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_read) |
| 🧩 **CAPTCHA Task Types** | reCAPTCHA, Turnstile, GeeTest, DataDome, and WAF specs | [View Tasks](https://docs.capmonster.cloud/docs/captchas/?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_read) |
| ⚙️ **API Methods** | `createTask`, `getTaskResult`, `getBalance` reference | [API Reference](https://docs.capmonster.cloud/docs/methods/?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_read) |
| 🌐 **Browser Extensions** | Chrome and Firefox automatic captcha solving guides | [Extension Docs](https://docs.capmonster.cloud/docs/extension/?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_read) |

---

## 💻 Official SDKs & Integrations

Accelerate your automation pipeline with our official client libraries and integrations:

- 🐍 **[Python SDK](https://github.com/CapMonsterCloud/capmonster-python-captcha-solver)** — Async, Playwright, Selenium, and Requests.
- 🟢 **[Node.js / JavaScript SDK](https://github.com/CapMonsterCloud/capmonster-nodejs-captcha-solver)** — Official Node.js library with TypeScript support.
- 🔷 **[.NET / C# SDK](https://github.com/CapMonsterCloud/capmonster-dotnet-captcha-solver)** — Official .NET package for C# automation projects.
- 🧩 **[n8n Community Node](https://github.com/CapMonsterCloud/capmonster-n8n-captcha-solver)** — No-code workflow automation node.
- 🤖 **[MCP Server](https://github.com/CapMonsterCloud/capmonster-mcp-captcha-solver)** — Connect AI agents (Claude, Cursor, etc.) directly to CapMonster Cloud via Model Context Protocol.
- 🎭 **[MCP Server for Patchright](https://github.com/CapMonsterCloud/capmonster-mcp-patchright-captcha-solver)** — Stealth browser automation with built-in captcha solving for AI agents.
- 📦 **[All Repositories & SDKs](https://github.com/orgs/CapMonsterCloud/repositories)** — Full list of open-source tools.

---

## 🛠 For Contributors & Maintainers

This documentation portal is built with **[Docusaurus 3](https://docusaurus.io/)**. Follow the instructions below to preview or contribute to the documentation locally.

### 1. Installation

Install the project dependencies using Yarn or npm:

```bash
yarn install
# or
npm install
```

### 2. Local Development

Start a local development server with live reload:

```bash
# Start English docs (default)
yarn start

# Start Russian docs
yarn start -- --locale ru
```

### 3. Build & Production Preview

Generate static content into the `build` directory:

```bash
yarn build
yarn serve
```

### 📁 Localization & Directory Structure

- **Russian documentation:** located in the `/docs` directory.
- **English documentation:** located in `/i18n/en/docusaurus-plugin-content-docs/current/`.

> When adding a new article, create the corresponding markdown file in both directories with identical filenames and category paths.

---

### 🚀 Deployment

The live site is built and published by **Cloudflare Pages** (project `capmonstercloud-docs-v2`) directly from this GitHub repository. Every push to `master` triggers a production build. There is no deploy step in this repo — merging to `master` **is** the deploy.

The Cloudflare build runs `npm run build`, which is:

1. `node scripts/generate-llms.mjs` — generates the plain-text documentation for AI agents (see below);
2. `docusaurus build` — builds the site into `build/`.

Search (Algolia) credentials are provided as environment variables in the Cloudflare Pages project settings. **Never commit them to this repository** — it is public.

The `Dockerfile` is a legacy artifact from a previous hosting setup and is not used by the current deployment.

### 🤖 Text version for AI agents (llms.txt / MCP)

Alongside the HTML pages the build publishes plain-text copies of the documentation, used by the [CapMonster Cloud MCP server](https://github.com/CapMonsterCloud/capmonster-mcp-captcha-solver) and other AI agents:

- `https://docs.capmonster.cloud/llms.txt` — index of all pages with short descriptions;
- `https://docs.capmonster.cloud/llms-full.txt` — the whole documentation in one file;
- `https://docs.capmonster.cloud/docs/<page>.txt` — one file per page, e.g. `/docs/captchas/recaptcha-v3-task/` → `/docs/captchas/recaptcha-v3-task.txt`.

They are generated from the English MDX sources on every build by `scripts/generate-llms.mjs` (output is git-ignored), so they are always in sync with the deployed pages. Content that lives in React components rather than MDX (`<McpNotice/>`, `<PriceBlock/>`, `<BlogLink/>`) is rendered to text by that script — if you add a new content-bearing component, teach the script about it too.

To check locally:

```bash
npm run build          # generates txt files + builds the site
npm run verify-llms    # checks that txt files exist and match the built pages
```

The same check runs in GitHub Actions (`.github/workflows/llms-txt.yml`) on every pull request.

---

## 📄 License

[MIT](./LICENSE) © [CapMonster Cloud](https://capmonster.cloud/en/?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_read)
