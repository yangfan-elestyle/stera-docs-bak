import type { StaticImageData } from 'next/image';

// Import all static assets here.
import image_get_started_index_img from '@/public/docs/fd15563-API______elepay.png';
import image_get_started_index_img_smcc from '@/public/docs/fd15564-API______elepay.png';
import image_get_started_charge_img from '@/public/docs/f40064d-______elepay.png';
import image_get_started_charge_img_smcc from '@/public/docs/f40064d-______elepay2.png';
import image_get_started_refunds_img1 from '@/public/docs/e0fa380-______elepay.png';
import image_get_started_refunds_img1_smcc from '@/public/docs/e0fa380-______elepay2.png';
import image_get_started_refunds_img2 from '@/public/docs/7d1820f-______elepay.png';
import image_get_started_refunds_img2_smcc from '@/public/docs/7d1820f-______elepay2.png';
import image_server_webhook_img1 from '@/public/docs/0db64b6-Webhook______elepay.png';
import image_server_webhook_img2 from '@/public/docs/585eb50-Webhook_______elepay.png';
import image_server_webhook_img1_smcc from '@/public/docs/0db64b6-Webhook______elepay2.png';
import image_server_webhook_img2_smcc from '@/public/docs/585eb50-Webhook_______elepay2.png';
import image_sdks_url_scheme_img1 from '@/public/docs/8ff36ca-IMG_0665.png';
import image_sdks_url_scheme_img2 from '@/public/docs/bda4ad9-IMG_0666.png';
import image_sdks_url_scheme_img3 from '@/public/docs/62d3dac-IMG_0667.png';
import image_sdks_url_scheme_img1_smcc from '@/public/docs/8ff36ca-IMG_06652.png';
import image_sdks_url_scheme_img2_smcc from '@/public/docs/bda4ad9-IMG_06662.png';
import image_sdks_url_scheme_img3_smcc from '@/public/docs/62d3dac-IMG_06672.png';

// Texts per tenant
export const TENANT_TEXTS = {
  default: {
    elepay: 'elepay',
    home_sidebar_title: 'elepay Docs',
    dashboard_url: 'https://dashboard.elepay.io/',
  },
  smcc: {
    elepay: 'stera smart one',
    home_sidebar_title: 'stera smart one Docs',
    dashboard_url: 'https://dashboard.sterasmartone.com/',
  },
} as const satisfies {
  default: Record<string, string>;
  smcc: Record<string, string>;
};

// Images per tenant
export const TENANT_IMAGES = {
  default: {
    'image.get-started.index.img': image_get_started_index_img,
    'image.get-started.charge.img': image_get_started_charge_img,
    'image.get-started.refunds.img1': image_get_started_refunds_img1,
    'image.get-started.refunds.img2': image_get_started_refunds_img2,
    'image.server.webhook.img1': image_server_webhook_img1,
    'image.server.webhook.img2': image_server_webhook_img2,
    'image.sdks.url-scheme.img1': image_sdks_url_scheme_img1,
    'image.sdks.url-scheme.img2': image_sdks_url_scheme_img2,
    'image.sdks.url-scheme.img3': image_sdks_url_scheme_img3,
  },
  smcc: {
    'image.get-started.index.img': image_get_started_index_img_smcc,
    'image.get-started.charge.img': image_get_started_charge_img_smcc,
    'image.get-started.refunds.img1': image_get_started_refunds_img1_smcc,
    'image.get-started.refunds.img2': image_get_started_refunds_img2_smcc,
    'image.server.webhook.img1': image_server_webhook_img1_smcc,
    'image.server.webhook.img2': image_server_webhook_img2_smcc,
    'image.sdks.url-scheme.img1': image_sdks_url_scheme_img1_smcc,
    'image.sdks.url-scheme.img2': image_sdks_url_scheme_img2_smcc,
    'image.sdks.url-scheme.img3': image_sdks_url_scheme_img3_smcc,
  },
} as const satisfies {
  default: Record<string, StaticImageData>;
  smcc: Record<string, StaticImageData>;
};
