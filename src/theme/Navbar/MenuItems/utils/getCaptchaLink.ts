import { getMainLocale } from './getMainLocale';

export const CAPTCHA_ID_TO_PAGES: Readonly<Partial<Record<string, string>>> = {
  amazonwaf: 'aws-waf',
  text: 'image-to-text',
  rc2: 'recaptcha-v2',
  rc2e: 'recaptcha-enterprise',
  mtcaptcha: 'mtcaptcha',
  recaptcha3: 'recaptcha-v3',
  prosopo: 'prosopo',
  altcha: 'altcha',
  geetest1: 'geetest-v3',
  geetest2: 'geetest-v4',
  datadome: 'datadome',
  'cf-turnstile': 'cloudflare-turnstile',
  'cloudflare-challenge': 'cloudflare-bot-challenge',
  'cloudflare-waitingroom': 'cloudflare-waitingroom',
  'cf-botchallenge': 'cloudflare-bot-challenge',
  imperva: 'imperva',
  yidun: 'yidun',
  'complex-rec_oocl_rotate_new': 'complex-image',
  funcaptcha: 'funcaptcha',
  tencent: 'tendi',
} as const;

export const CAPTCHA_DUPLICATES: Readonly<Partial<Record<string, ReadonlyArray<{ id: string; name?: string }>>>> = {
  'cf-botchallenge': [
    { id: 'cloudflare-challenge', name: 'Cloudflare Challenge' },
    { id: 'cloudflare-waitingroom', name: 'Cloudflare Waiting Room' },
  ],
  geetest: [
    { id: 'geetest1', name: 'GeeTest v3' },
    { id: 'geetest2', name: 'GeeTest v4' },
  ],
} as const;

export const getCaptchaLink = (currentLocale: string, LinkKey: string, Id: string, baseLandingUrl: string) => {
  if (CAPTCHA_ID_TO_PAGES[Id]) {
    return `${baseLandingUrl}/${getMainLocale(currentLocale)}/${CAPTCHA_ID_TO_PAGES[Id]}`;
  }
  return `${currentLocale === 'en' ? '' : `/${currentLocale}`}/docs/captchas/${LinkKey}`;
};
