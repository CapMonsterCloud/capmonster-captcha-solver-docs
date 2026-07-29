<p align="center">
  <img src="https://github.com/CapMonsterCloud/capmonster-captcha-solver-docs/blob/master/static/img/logo_docs.svg" alt="CapMonster Cloud CAPTCHA Solver Documentation">
</p>

# CapMonster Cloud API Documentation & CAPTCHA Solver Guides

Welcome to the official documentation repository for **CapMonster Cloud** — the fastest AI-powered CAPTCHA solver and anti-bot bypass infrastructure. 

Here you will find API references, integration guides, and code examples for bypassing reCAPTCHA, Cloudflare Turnstile, hCaptcha, DataDome, and more.

**[👉 Get your Free API Key and Start Solving CAPTCHAs](https://capmonster.cloud/Dashboard/Registration?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_readme)**

---

## 📚 Table of Contents

Navigate to our official hosted documentation to get started:
- 🚀 **[Getting Started & Quick Setup](https://docs.capmonster.cloud/docs/getting-started)**
- 🧩 **[CAPTCHA Task Types & API Reference](https://docs.capmonster.cloud/docs/captchas/)**
- 💻 **[Official SDKs (Python, Node.js, C#, Go)](https://docs.capmonster.cloud/docs/api/libraries)**
- 💳 **[Account & Balance Management](https://docs.capmonster.cloud/docs/account/)**

*(Looking for a specific integration? Check out our [n8n Community Node](https://github.com/CapMonsterCloud/n8n-nodes-capmonstercloud) or direct [Chrome Extension](https://capmonster.cloud/extension?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_readme)).*

---

## 🛠 For Contributors & Maintainers

This documentation website is built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator. The instructions below are for developers who want to run or edit this documentation locally.

### Installation

Install the required dependencies using Yarn or npm:

```bash
yarn
# or
npm install
```

### Local Development

To start a local development server with hot-reloading:

```bash
yarn start
```
This command opens up a browser window. Most changes are reflected in real time, with no need to restart the server. By default, this runs the **English** version.

If you want to start the **Russian** version locally, run:

```bash
yarn start -- --locale ru
```

### Build for Production

```bash
yarn build
```
This command generates static content into the `build` directory, which can be served using any static content hosting service.

After the build, you can view the fully generated site (including both `ru` and `en` locales) by running:

```bash
yarn serve
```

### Directory Structure & Localization

- **Russian documentation** is located in the `/docs` directory.
- **English documentation** is located in `/i18n/en/docusaurus-plugin-content-docs/current/`.

Each folder represents a category for the articles. If you need the same article for both the `ru` and `en` versions, you must create a markdown file in both directories with the exact same filename and folder structure.

For more information about markdown syntax and Docusaurus structure, visit the [official Docusaurus docs](https://docusaurus.io/).

---
**[Get your CapMonster Cloud API Key](https://capmonster.cloud/Dashboard/Registration?utm_source=github&utm_medium=referral&utm_campaign=docs_repo_readme)**
