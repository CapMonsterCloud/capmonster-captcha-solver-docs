// import React, { useEffect } from 'react';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// import Layout from '@theme/Layout';
// import Libraries from '@site/src/components/Libraries';
// import Links from '@site/src/components/Links';
// import MainHero from '../components/MainHero';
// import Prices from '../components/Prices';
// import Head from '@docusaurus/Head';
// import Footer from '../components/Footer';
// import { useFetchMetadata } from '../hooks/useFetchMetadata';
// import { Loader } from '../components/Loader';
// import { SeoCover } from '../theme/ArticleHead';
//
// export default function Home() {
//   const { siteConfig } = useDocusaurusContext();
//
//   const { isLoading, metadata } = useFetchMetadata({ slug: '/' });
//
//   const scrollToHash = () => {
//     if (window.location.hash === '#price') {
//       const priceElement = document.getElementById('price');
//       if (priceElement) priceElement.scrollIntoView({ behavior: 'smooth' });
//     }
//   };
//
//   useEffect(() => {
//     scrollToHash();
//   }, []);
//
//   const seo = metadata?.attributes?.seo;
//
//   return (
//     <Layout title={`Hello from ${siteConfig.title}`} description="Description will go into a meta tag in <head />">
//       <main>
//         <Head>
//           <meta name="google-site-verification" content="LTaYcyNwaZKXhoWI-eqaxSJ1IX6zF3NJrjACTp41Tyg" />
//           <meta name="algolia-site-verification" content="11F1E44583A33489" />
//
//           {seo?.metaTitle && <title>{seo.metaTitle}</title>}
//           {seo?.metaDescription && <meta name="description" content={seo.metaDescription} />}
//           {seo && SeoCover(seo)}
//         </Head>
//
//         {isLoading && <Loader />}
//         <MainHero />
//         <Libraries />
//         <Links />
//         <Prices />
//         <Footer />
//       </main>
//     </Layout>
//   );
// }

import React from 'react';
import { Redirect, useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Home() {
  const location = useLocation();
  const gettingStartUrl = useBaseUrl('/docs/getting-start/');
  return <Redirect to={`${gettingStartUrl}${location.search}${location.hash}`} />;
}
