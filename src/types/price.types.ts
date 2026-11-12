export type PriceName =
  | 'reCAPTCHA v2'
  | 'reCAPTCHA v3'
  | 'reCAPTCHA Enterprise'
  | 'GeeTest'
  | 'Cloudflare Turnstile'
  | 'Cloudflare Bot Challenge'
  | 'DataDome'
  | 'Tencent captcha'
  | 'Amazon Waf'
  | 'Faucet Pay'
  | 'Imperva (Incapsula)'
  | 'Prosopo'
  | 'Text Captcha'
  | 'Binance'
  | 'ComplexImageTask Recaptcha'
  | 'ComplexImageTask Recognition'
  | 'reCAPTCHA Enterprise (Spotify, Yahoo)'
  | 'Temu'
  | 'Yidun'
  | 'FengkongCloud'
  | 'ARCaptcha'
  | 'HeyTap'
  | 'Proton Captcha';

export type PriceId =
  | 'rc2'
  | 'recaptcha3'
  | 'rc2e'
  | 'geetest'
  | 'cf-turnstile'
  | 'cf-botchallenge'
  | 'datadome'
  | 'tencent'
  | 'amazonwaf'
  | 'faucetpay'
  | 'imperva'
  | 'prosopo'
  | 'text'
  | 'binance'
  | 'complex-rc2_3x3'
  | 'complex-rc2_3x3_dynamic'
  | 'complex-rc2_4x4'
  | 'complex-rec_oocl_rotate_new'
  | 'complex-rec_oocl_rotate_double_new'
  | 'complex-rec_betpunch_3x3_rotate_request'
  | 'complex-rec_bls'
  | 'rc2e-spotify-yahoo'
  | 'temu'
  | 'complex-rc2e-spotify-yahoo'
  | 'complex-rc2e'
  | 'complex-rc2'
  | 'complex-rec_baidu'
  | 'yidun'
  | 'fengkongcloud'
  | 'arcaptcha'
  | 'heytap'
  | 'proton';

export type PriceResponseItem = {
  Id: PriceId;
  Name: PriceName;
  LogoPath: string;
  SubType: null | string;
  SubTypeLogoPath: null | string;
  Price: number;
  SuccessRate: number;
  Speed: number;
  LinkKey: string;
  ResultType: 'token' | 'image' | 'answers' | 'dynamic';
};

export type FetchPricesResponse = {
  PricesV2: PriceResponseItem[];
};

export type NormalizedPriceItem = PriceResponseItem & {
  imagePath?: string;
};

export type NormalizedPrices = Record<PriceId, NormalizedPriceItem>;
