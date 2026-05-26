import React from 'react';
import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import getLocaleStrings from '../../locales/index';
import { PricesProvider } from '../../PricesProvider';

const normalizeLocale = (locale: string) => {
  const parts = locale.split('-');

  if (parts.length === 2) {
    return `${parts[0]}-${parts[1].toUpperCase()}`;
  }

  return locale;
};

const PriceBlockWrap = ({ children }: React.PropsWithChildren) => {
  const { i18n } = useDocusaurusContext();
  const { currentLocale } = i18n;

  const normalizedLocale = normalizeLocale(currentLocale);

  const { fullPriceText } = getLocaleStrings(currentLocale);

  return (
    <PricesProvider>
      <div className={styles.wrap}>
        <div className={styles.linkWrap}>
          <a href={`https://capmonster.cloud/${normalizedLocale}/prices/`} target="_blank" className={styles.link}>
            {fullPriceText}
          </a>
        </div>

        <div className={styles.wrapBlock}>{children}</div>
      </div>
    </PricesProvider>
  );
};

export default PriceBlockWrap;
