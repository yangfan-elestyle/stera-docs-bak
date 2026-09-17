import type { AdminLocale } from './i18n/shared';

/**
 * 会被写进文档正文 / meta.json 的占位文字。
 *
 * 这一份 MUST 按「正在编辑的那个语言文件」取, MUST NOT 跟界面语言走 ——
 * 界面语言只决定后台自己的按钮与提示怎么显示; 一旦文字落进 mdx 或 meta.json,
 * 它就是那个语言版本的内容了。日语母语者把界面切成日文去编辑中文页时,
 * 插进去的表头必须是「列一 / 列二」而不是「列 1 / 列 2」。
 *
 * 所以它不在 `lib/admin/i18n/dict` 里: 那三份是界面文案, 客户端只拿当前一份;
 * 这一份三种语言都要在客户端手边, 才能按内容语言即时取。体量很小, 值当。
 */
interface InsertText {
  calloutTitle: string;
  calloutBody: string;
  warnTitle: string;
  bold: string;
  italic: string;
  linkText: string;
  heading: string;
  listItem1: string;
  listItem2: string;
  step1: string;
  step2: string;
  quote: string;
  tableCol1: string;
  tableCol2: string;
  tableCell: string;
  mermaidStart: string;
  mermaidEnd: string;
  newSeparator: string;
  newPageTitle: string;
}

export const INSERT_TEXT: Record<AdminLocale, InsertText> = {
  ja: {
    calloutTitle: 'タイトル',
    calloutBody: '内容',
    warnTitle: '注意',
    bold: '太字',
    italic: '斜体',
    linkText: 'リンクテキスト',
    heading: '見出し',
    listItem1: '項目 1',
    listItem2: '項目 2',
    step1: 'ステップ 1',
    step2: 'ステップ 2',
    quote: '引用文',
    tableCol1: '列 1',
    tableCol2: '列 2',
    tableCell: '内容',
    mermaidStart: '開始',
    mermaidEnd: '終了',
    newSeparator: '---新しい区切り---',
    newPageTitle: '新しいページ',
  },
  en: {
    calloutTitle: 'Title',
    calloutBody: 'Content',
    warnTitle: 'Note',
    bold: 'bold text',
    italic: 'italic text',
    linkText: 'link text',
    heading: 'Heading',
    listItem1: 'Item 1',
    listItem2: 'Item 2',
    step1: 'Step 1',
    step2: 'Step 2',
    quote: 'Quoted text',
    tableCol1: 'Column 1',
    tableCol2: 'Column 2',
    tableCell: 'Content',
    mermaidStart: 'Start',
    mermaidEnd: 'End',
    newSeparator: '---New section---',
    newPageTitle: 'New page',
  },
  zh: {
    calloutTitle: '标题',
    calloutBody: '内容',
    warnTitle: '注意',
    bold: '粗体',
    italic: '斜体',
    linkText: '链接文字',
    heading: '标题',
    listItem1: '项目一',
    listItem2: '项目二',
    step1: '第一步',
    step2: '第二步',
    quote: '引用内容',
    tableCol1: '列一',
    tableCol2: '列二',
    tableCell: '内容',
    mermaidStart: '开始',
    mermaidEnd: '结束',
    newSeparator: '---新分段---',
    newPageTitle: '新页面',
  },
};

/** 内容语言取插入文案; 未知语言回落到默认语言那一份 */
export function insertText(locale: string): InsertText {
  return INSERT_TEXT[locale as AdminLocale] ?? INSERT_TEXT.ja;
}
