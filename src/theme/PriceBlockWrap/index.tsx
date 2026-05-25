import React from 'react';
import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import getLocaleStrings from '../../locales/index';
import { PricesProvider } from '../../PricesProvider';

const PriceBlockWrap = ({ children }: React.PropsWithChildren) => {
  const { i18n } = useDocusaurusContext();
  const { currentLocale } = i18n;
  const { fullPriceText } = getLocaleStrings(currentLocale);

  return (
    <PricesProvider>
      <div className={styles.wrap}>
        <div className={styles.linkWrap}>
          <a href={`https://capmonster.cloud/${currentLocale}/prices`} target="_blank" className={styles.link}>
            {fullPriceText}
          </a>
        </div>
        <div className={styles.wrapBlock}>{children}</div>
      </div>
    </PricesProvider>
  );
};

export default PriceBlockWrap;
