import { useHistory, useLocation } from '@docusaurus/router';
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

function UrlParameters(): null {
  const history = useHistory();
  const location = useLocation();
  const { setColorMode } = useColorMode();

  useEffect(() => {
    const theme = parseThemeParam(new URLSearchParams(location.search).get(THEME_PARAM));

    if (theme) {
      setColorMode(theme);
    }

    // Search queries remain part of the search page state.
    if (!location.search || /\/search\/?$/.test(location.pathname)) return;

    const analyticsWindow = window as typeof window & {
      google_tag_manager?: Record<string, unknown>;
    };
    let active = true;
    let timer: number | undefined;
    const deadline = Date.now() + 15000;

    const clean = () => {
      if (!active) return;
      active = false;
      if (
        history.location.pathname !== location.pathname ||
        history.location.search !== location.search ||
        history.location.hash !== location.hash
      ) return;
      history.replace({ ...history.location, search: '' });
    };

    const waitForContainer = () => {
      if (!active) return;
      if (analyticsWindow.google_tag_manager?.['GTM-PZCSDCS']) {
        // Container activity is a heuristic, not confirmation of linker processing.
        // Allow its Google tags additional time to consume the original URL.
        timer = window.setTimeout(clean, 500);
      } else if (Date.now() < deadline) {
        timer = window.setTimeout(waitForContainer, 100);
      }
      // If GTM is blocked or slow, retain the URL parameters for later processing.
    };

    waitForContainer();

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [history, location.pathname, location.search, location.hash, setColorMode]);

  return null;
}

export { UrlParameters };
