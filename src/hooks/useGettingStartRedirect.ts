import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

export const useGettingStartRedirect = () => {
  const location = useLocation();
  const gettingStartUrl = useBaseUrl('/docs/getting-start/');

  return `${gettingStartUrl}${location.search}${location.hash}`;
};
