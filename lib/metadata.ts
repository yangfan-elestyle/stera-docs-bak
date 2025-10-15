export const baseUrl =
  process.env.NODE_ENV === 'development' || !process.env.DOCS_BASE_URL
    ? new URL('http://localhost:3000')
    : new URL(process.env.DOCS_BASE_URL);
