import { generateFiles } from 'fumadocs-openapi';
import { openapi } from '@/lib/openapi';
import { i18n } from '@/lib/i18n';
import { rm } from 'node:fs/promises';
import * as path from 'node:path';

await rm('./content/docs/openapi/(generated)', {
  recursive: true,
  force: true,
});

await generateFiles({
  input: openapi,
  output: './content/docs/openapi/(generated)',
  includeDescription: true,
  groupBy: 'tag',
  beforeWrite(files) {
    // rename files to include language suffix
    // e.g., charge.mdx, charge.en.mdx, charge.zh.mdx
    const escapeRegExp = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const detectLangBySchemaId = (schemaId: string): string => {
      const candidates = i18n.languages.filter(
        (l) => l !== i18n.defaultLanguage,
      );
      for (const lang of candidates) {
        const re = new RegExp(`\\.${escapeRegExp(lang)}\\.ya?ml$`, 'i');
        if (re.test(schemaId)) return lang;
      }
      return i18n.defaultLanguage;
    };

    const addLangSuffix = (filePath: string, lang: string) => {
      const parsed = path.posix.parse(filePath);
      return path.posix.join(parsed.dir, `${parsed.name}.${lang}${parsed.ext}`);
    };

    for (const [schemaId, schemaFiles] of Object.entries(this.generated)) {
      const lang = detectLangBySchemaId(schemaId);
      if (lang === i18n.defaultLanguage) continue;
      for (const file of schemaFiles) {
        file.path = addLangSuffix(file.path, lang);
      }
    }

    void files;
  },
});
