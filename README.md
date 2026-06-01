<p align="center"><img src="https://github.com/CapMonsterCloud/docs/blob/master/static/img/logo_docs.svg"></p>


# Documentation for CapMonster Cloud

This website is built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```
or
```bash
npm install
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected in real time, no need to restart the server.
By default this is the English version.

If you want to start the Russian version, run

```bash
yarn start -- --locale ru
```

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

After build you can view fully generated site with `ru` and `en` versions, just run

```bash
yarn serve
```

## Structure

Russian documentation is located in `/docs`.

Each folder is a category for an article.

English documentation is located in `/i18n/en/docusaurus-plugin-content-docs/current/`.

If you need the same article for ru and en version, you should create a file in `/docs` and `/i18n/en/docusaurus-plugin-content-docs/current/` directories with same filename and folder.

For more information about syntax and structure, you can visit [https://docusaurus.io/](https://docusaurus.io/).