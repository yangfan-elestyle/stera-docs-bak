import { defineI18n } from 'fumadocs-core/i18n';

export const i18n = defineI18n({
  defaultLanguage: 'ja',
  languages: ['ja', 'en', 'zh'],
  fallbackLanguage: 'ja',
  hideLocale: 'always',
});
