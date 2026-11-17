import React, { useEffect, useState } from 'react';
import SubMenu from './SubMenu';
import { HeaderMenuSingleItem } from './types';
import { uniqBy } from './utils/uniqBy';
import { useFetchPrices } from '../../../hooks/useFetchPrices';
import { CAPTCHA_DUPLICATES, getCaptchaLink } from './utils/getCaptchaLink';
import { getMainLocale } from './utils/getMainLocale';
import { useBaseUrl } from '../../../hooks/useBaseUrl.ts';

const SolutionSubMenu = ({
  handleClick,
  locale,
  title,
}: {
  handleClick?: () => void;
  locale: string;
  title: string;
}) => {
  const { baseDashboardUrl, baseLandingUrl } = useBaseUrl();

  const { prices, loading: isPricesLoading } = useFetchPrices(false);
  const link = {
    title,
    isTwoColumn: true,
    isSolutionItem: true,
  };
  const [subItems, setSubItems] = useState<HeaderMenuSingleItem[]>([]);

  const normalizePrices = (prices: Record<string, any>[]) => {
    const pricesMap = prices.reduce<Partial<Record<string, any>>>((acc, el) => {
      const priceKey = el.ResultType === 'image' ? 'priceComplex' : 'price';
      const currenEl = acc[el.Name] ?? el;

      return { ...acc, [el.Name]: { ...currenEl, [priceKey]: el.Price } };
    }, {});

    return Object.values(pricesMap);
  };

  const fetchSolutionItems = async () => {
    const captchas = [
      {
        icon: <img src="/img/24x24_rc.svg" alt="rc" />,
        title: 'reCAPTCHA',
        url: `${baseLandingUrl}/${getMainLocale(locale)}/recaptcha`,
        gtmId: `header-solutions-recaptcha-btn`,
      },
      ...uniqBy(normalizePrices(prices), 'Name')?.flatMap(priceItem => {
        const variants = CAPTCHA_DUPLICATES[priceItem.Id] ?? [{ id: priceItem.Id, name: priceItem.Name }];

        return variants.map(variant => ({
          icon: <img src={`${baseDashboardUrl}${priceItem.LogoPath}`} width={24} height={24} alt={variant.name || priceItem.Name} />,
          title: variant.name || priceItem.Name,
          url: getCaptchaLink(locale, priceItem.LinkKey, variant.id, baseLandingUrl),
          gtmId: `header-solutions-${variant.id}-docs-btn`,
        }));
      }),
      {
        icon: <img src={`${baseDashboardUrl}/img/landing/complexTask.svg`} width={24} height={24} alt="complex task" />,
        title: 'ComplexImage Recognition',
        url: getCaptchaLink(locale, '', 'complex-rec_oocl_rotate_new', baseLandingUrl),
        gtmId: 'header-solutions-complex-rec_oocl_rotate_new-docs-btn',
      },
    ];
    setSubItems(captchas);
  };

  useEffect(() => {
    fetchSolutionItems();
  }, [locale, prices, isPricesLoading]);

  return <SubMenu link={{ ...link, subItems }} handleClick={handleClick} />;
};

export default SolutionSubMenu;
