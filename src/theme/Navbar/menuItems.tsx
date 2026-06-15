import React from 'react';
import { DefaultNavbarItemProps } from '@theme/NavbarItem';

import { localesMappings } from '../../locales';
import ptBrNavbar from '../../../i18n/pt-br/docusaurus-theme-classic/navbar.json';
import enNavbar from '../../../i18n/en/docusaurus-theme-classic/navbar.json';
import ruNavbar from '../../../i18n/ru/docusaurus-theme-classic/navbar.json';
import zhNavbar from '../../../i18n/zh/docusaurus-theme-classic/navbar.json';
import ProductsSubMenu from './MenuItems/ProductsSubMenu';
import { HeaderLink } from './MenuItems/HeaderLink';
import SolutionSubMenu from './MenuItems/SolutionSubMenu';

const messages: Record<string, Record<string, { message: string; description: string }>> = {
  en: enNavbar,
  'pt-br': ptBrNavbar,
  zh: zhNavbar,
  ru: ruNavbar,
};

const getLabel = (locale: string, key: string, fallback: string) => {
  const messageSet = messages[locale];
  return messageSet?.[key]?.message || fallback;
};

const leftItems: DefaultNavbarItemProps[] = [];

export const getMenuItems = (locale: string) => {
  const typedLocales = localesMappings as Record<string, string>;
  const rightItems: DefaultNavbarItemProps[] = [
    {
      type: 'component',
      className: '',
      render: ({ onClick }: { onClick?: () => void } = {}) => <ProductsSubMenu locale={locale} getLabel={getLabel} />,
    } as unknown as DefaultNavbarItemProps,
    {
      type: 'component',
      className: '',
      render: ({ onClick }: { onClick?: () => void } = {}) => (
        <SolutionSubMenu locale={locale} title={getLabel(locale, 'item.label.HeaderSolutions', 'Solutions')} />
      ),
    } as unknown as DefaultNavbarItemProps,

    {
      type: 'component',
      className: '',
      render: ({ onClick }: { onClick?: () => void } = {}) => (
        <HeaderLink onClick={onClick} href={`https://capmonster.cloud/${typedLocales[locale]}#new-plans`}>
          {getLabel(locale, 'item.label.HeaderPrice', 'Price')}
        </HeaderLink>
      ),
    } as unknown as DefaultNavbarItemProps,
    {
      type: 'component',
      className: '',
      render: ({ onClick }: { onClick?: () => void } = {}) => (
        <HeaderLink onClick={onClick} href={`https://capmonster.cloud/${typedLocales[locale]}/blog`}>
          {getLabel(locale, 'item.label.HeaderBlog', 'Blog')}
        </HeaderLink>
      ),
    } as unknown as DefaultNavbarItemProps,
    {
      type: 'component',
      className: '',
      render: ({ onClick }: { onClick?: () => void } = {}) => (
        <HeaderLink onClick={onClick} href={`https://capmonster.cloud/${typedLocales[locale]}/`}>
          {getLabel(locale, 'item.label.MainSite', 'Site')}
        </HeaderLink>
      ),
    } as unknown as DefaultNavbarItemProps,
    {
      type: 'component',
      className: '',
      render: ({ onClick }: { onClick?: () => void } = {}) => (
        <HeaderLink onClick={onClick} href={'/docs/getting-start'}>
          {getLabel(locale, 'item.label.Документация', 'Docs')}
        </HeaderLink>
      ),
    } as unknown as DefaultNavbarItemProps,
    {
      href: `https://dash.capmonster.cloud?culture=${typedLocales[locale]}`,
      label: getLabel(locale, 'item.label.Личный кабинет', 'Dashboard'),
      position: 'right',
      className: 'lk-link',
    },
    {
      type: 'localeDropdown',
      position: 'right',
      dropdownItemsBefore: [],
      dropdownItemsAfter: [],
      href: '',
      label: '',
      className: 'localeDropdownWithFlags',
    },
  ];

  return { leftItems, rightItems };
};
