import type { Config } from '@docusaurus/types';
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;
require('dotenv').config();
const config: Config = {
  title: 'Capmonster Cloud Docs',
  favicon: 'img/favicon.ico',
  trailingSlash: true,
  // Set the production url of your site here
  url: 'https://docs.capmonster.cloud',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'ZennoLab', // Usually your GitHub org/user name.
  projectName: 'CapmonsterCloud', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'zh', 'pt-br'],
  },
  customFields: {
    APP_ENV: process.env.APP_ENV,
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // routeBasePath: '/',
          showLastUpdateTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: (params: { versionDocsDirPath: string; docPath: string; locale: string }) => {
            const { versionDocsDirPath, docPath, locale } = params;

            const baseUrl = 'https://github.com/CapMonsterCloud/docs/tree/dev';

            if (locale === 'ru') {
              return `${baseUrl}/${versionDocsDirPath}/${docPath}`;
            }

            return `${baseUrl}/i18n/${locale}/docusaurus-plugin-content-docs/current/${docPath}`;
          },
        },
        blog: false,
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  headTags: [
    {
      tagName: 'script',
      attributes: {
        async: 'true',
        src: 'https://www.googletagmanager.com/gtm.js?id=GTM-PZCSDCS',
      },
    },
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
      `,
    },
  ],
  themeConfig: {
    // announcementBar: {
    //   id: 'support_us',
    //   content:
    //     'Попробуйте наше <a target="_blank" rel="noopener noreferrer" href="https://chrome.google.com/webstore/detail/capmonster-cloud-%E2%80%94-automa/pabjfbciaedomjjfelfafejkppknjleh">расширение</a> для автоматического решения капч',
    //   backgroundColor: '#0FB97D',
    //   textColor: 'white',
    //   isCloseable: false,
    // },
    algolia: {
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: process.env.ALGOLIA_INDEX_NAME,
      contextualSearch: true,
    },
    // Replace with your project's social card
    image: 'img/social-card.jpg',
    navbar: {
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo_landing.svg',
      },
      items: [
        // костыль для мобильного меню, что бы бургер-меню отрендрилось, так работает useNavbarMobileSidebar
        {
          label: 'Пусто',
          to: '#',
          position: 'left',
        },
      ],
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ['json', 'java', 'bash', 'csharp', 'http'],
    },
  },
};

module.exports = config;
