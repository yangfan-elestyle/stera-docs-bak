const ERROR_CODES_URL_BY_ENV = {
  staging: 'https://stg-api.stg.elepay.dev/error-codes',
  product: 'https://api.elepay.io/error-codes',
} as const;

export type DocsEnv = keyof typeof ERROR_CODES_URL_BY_ENV;

// Staging is the implicit default. Only an explicit `product` value flips
// the environment, so local dev and any non-prod deploy never need to set
// DOCS_ENV.
export function getDocsEnv(
  value: string | undefined = process.env.DOCS_ENV,
): DocsEnv {
  return value === 'product' ? 'product' : 'staging';
}

export function getErrorCodesUrl(env = getDocsEnv()) {
  return ERROR_CODES_URL_BY_ENV[env];
}
