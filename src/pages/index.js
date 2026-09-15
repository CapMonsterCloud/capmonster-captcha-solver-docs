import React from 'react';
import { Redirect } from '@docusaurus/router';
import { useGettingStartRedirect } from '../hooks/useGettingStartRedirect';

export default function Home() {
  const to = useGettingStartRedirect();
  return <Redirect to={to} />;
}
