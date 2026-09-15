import { useLocation } from '@docusaurus/router';
import { useColorMode } from '@docusaurus/theme-common';
import { useEffect } from 'react';

type ColorMode = 'light' | 'dark';

const THEME_PARAM = 'theme';

function parseThemeParam(value: string | null): ColorMode | null {
  if (value === 'dark' || value === 'light') {
    return value;
  }

  return null;
}

function ThemeFromUrl(): null {
  const location = useLocation();
  const { setColorMode } = useColorMode();

  useEffect(() => {
    const theme = parseThemeParam(new URLSearchParams(location.search).get(THEME_PARAM));

    if (theme) {
      setColorMode(theme);
    }
  }, [location.search, setColorMode]);

  return null;
}

export { ThemeFromUrl };
