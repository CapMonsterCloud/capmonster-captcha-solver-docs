import React from 'react';
import LayoutOriginal from '@theme-original/Layout';
import { PageMetadata, ErrorCauseBoundary } from '@docusaurus/theme-common';
import BadTokenBlock from '../BadTokenBlock/index.js';
import { useKayakaoInit } from './useKayakoInit.ts';
import { useReplaceUserAgent } from './useReplaceUserAgent.ts';
import { ThemeFromUrl } from './useThemeFromUrl.ts';

interface LayoutProps {
  title?: string;
  description?: string;
  noFooter?: boolean;
  wrapperClassName?: string;
  children: React.ReactNode;
}

export default function CustomLayout(props: LayoutProps) {
  const { title, description, children, ...rest } = props;

  useReplaceUserAgent();
  useKayakaoInit();

  return (
    <LayoutOriginal {...rest}>
      <ThemeFromUrl />
      <ErrorCauseBoundary onError={(error: Error) => error}>
        <>
          <PageMetadata title={title} description={description} />
          <BadTokenBlock />
          {children}
        </>
      </ErrorCauseBoundary>
    </LayoutOriginal>
  );
}
