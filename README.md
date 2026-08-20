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
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-orange.svg?style=flat-square" alt="License: MIT"></a>
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

- 🐍 **[Python SDK (capmonstercloudclient)](https://github.com/ZennoLab/capmonstercloud-client-python)** — Async, Playwright, Selenium, and Requests.
- 🟢 **[Node.js / JavaScript SDK](https://github.com/CapMonsterCloud/capmonster-nodejs-captcha-solver)** — Official Node.js library with TypeScript support.
- 🔷 **[.NET / C# SDK](https://github.com/CapMonsterCloud/capmonster-dotnet-captcha-solver)** — Official .NET package for C# automation projects.
- 🧩 **[n8n Community Node](https://github.com/CapMonsterCloud/capmonster-n8n-captcha-solver)** — No-code workflow automation node.
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

## 📄 License

[MIT](LICENSE) © [ZennoLab](https://zennolab.com/) / [CapMonster Cloud](https://capmonster.cloud/en/?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_read)
