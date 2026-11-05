import React from 'react';
import Link from '@docusaurus/Link';
import Admonition from '@theme/Admonition';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const translations = {
  ru: {
    title: 'CapMonster Cloud MCP',
    text: 'Для распознавания и решения CAPTCHA также можно использовать CapMonster Cloud MCP',
    link: 'Подробнее о работе с MCP',
  },

  en: {
    title: 'CapMonster Cloud MCP',
    text: 'CapMonster Cloud MCP can also be used to detect and solve CAPTCHA',
    link: 'Learn more about MCP',
  },

  'pt-br': {
    title: 'CapMonster Cloud MCP',
    text: 'O CapMonster Cloud MCP também pode ser usado para detectar e resolver CAPTCHA',
    link: 'Saiba mais sobre o MCP',
  },

  zh: {
    title: 'CapMonster Cloud MCP',
    text: '还可以使用 CapMonster Cloud MCP 检测并解决 CAPTCHA',
    link: '了解有关 MCP 的更多信息',
  },
};

export default function McpNotice() {
  const { i18n } = useDocusaurusContext();

  const locale = i18n.currentLocale.toLowerCase();
  const content = translations[locale] || translations.en;

  return (
    <Admonition type="tip" title={content.title} className="mcp-notice">
      <div className="mcp-notice__text">
        <div>{content.text}</div>

        <div className="mcp-notice__link">
          <Link to="/docs/mcp/">{content.link}</Link>.
        </div>
      </div>
    </Admonition>
  );
}