import { openapi } from '@/lib/openapi';
import { phpCodeSample } from '@/lib/openapi/php-code-sample.client';
import { createAPIPage } from 'fumadocs-openapi/ui';
import client from './api-page.client';

export const APIPage = createAPIPage(openapi, {
  client,
  generateCodeSamples: () => [
    {
      id: 'php',
      label: 'PHP',
      lang: 'php',
      source: phpCodeSample,
    },
  ],
});
