import { createOpenAPI } from 'fumadocs-openapi/server';
import openapiJa from '@/data/openapi/openapi.json';
import openapiEn from '@/data/openapi/openapi.en.json';
import openapiZh from '@/data/openapi/openapi.zh.json';

export const openapi = createOpenAPI({
  input: () =>
    ({
      './openapi.yaml': openapiJa,
      './openapi.zh.yaml': openapiZh,
      './openapi.en.yaml': openapiEn,
    } as any),
});
