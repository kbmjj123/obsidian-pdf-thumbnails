import {
  DEFAULT_PREVIEW_TEXTS,
  interpolate,
  type PreviewTexts,
} from '@kbmjj123/pdf-thumbnails-core'

export const SITE_URL = 'https://minopdf.com'

export type Lang = 'zh' | 'en'

function detectLang(): Lang {
  let locale = ''
  try {
    // Obsidian exposes moment globally in the app; guard for tests.
    const m = (globalThis as Record<string, unknown>).moment as
      | { locale?: () => string }
      | undefined
    locale = m?.locale?.() ?? ''
  } catch {
    /* ignore */
  }
  if (!locale && typeof navigator !== 'undefined' && navigator.language) {
    locale = navigator.language
  }
  return locale.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export const lang: Lang = detectLang()

type Dict = Record<string, string>

const zh: Dict = {
  'settings.about': '在 Obsidian 里把 PDF 嵌入渲染成页面缩略图网格，点击可放大查看。所有处理都在本地完成。',
  'setting.overrideEmbeds.name': '覆盖 PDF 嵌入为缩略图',
  'setting.overrideEmbeds.desc': '在阅读模式下，把 ![[文件.pdf]] 嵌入渲染为页面缩略图网格；关闭则恢复原生 PDF 查看器。',
  'setting.columns.name': '缩略图列数',
  'setting.columns.desc': '缩略图网格的列数。',
  'setting.thumbWidth.name': '缩略图宽度',
  'setting.thumbWidth.desc': '每个缩略图的宽度（像素）。',
  'setting.maxPages.name': '初始渲染页数',
  'setting.maxPages.desc': '首次加载渲染的页数，其余随滚动懒加载。',
  'setting.kofi.name': '支持作者',
  'setting.kofi.desc': '如果这个工具对你有用，欢迎在 Ko-fi 上请我喝杯咖啡 ☕',
}

const en: Dict = {
  'settings.about': 'Render ![[file.pdf]] embeds as a lazy page-thumbnail grid; click a page to zoom. All processing is local.',
  'setting.overrideEmbeds.name': 'Override PDF embeds with thumbnails',
  'setting.overrideEmbeds.desc': 'In reading view, render ![[file.pdf]] embeds as a page-thumbnail grid; off restores the native PDF viewer.',
  'setting.columns.name': 'Thumbnail columns',
  'setting.columns.desc': 'Number of columns in the thumbnail grid.',
  'setting.thumbWidth.name': 'Thumbnail width',
  'setting.thumbWidth.desc': 'Width of each thumbnail in pixels.',
  'setting.maxPages.name': 'Initial pages',
  'setting.maxPages.desc': 'Pages rendered on first load; the rest lazy-load on scroll.',
  'setting.kofi.name': 'Support the author',
  'setting.kofi.desc': 'If this tool helps you, you can buy me a coffee on Ko-fi ☕',
}

export function t(key: string): string {
  const dict = lang === 'zh' ? zh : en
  return dict[key] ?? en[key] ?? key
}

/** Preview strings (page labels, loading…): English = core defaults; zh overrides the ones that differ. */
export function getPreviewTexts(): PreviewTexts {
  if (lang !== 'zh') return DEFAULT_PREVIEW_TEXTS
  return {
    ...DEFAULT_PREVIEW_TEXTS,
    pdf_title: 'PDF 预览',
    pdf_loading: '正在渲染 PDF 预览…',
    pdf_rendered: '已渲染 {rendered} / {total} 页',
    pdf_skipped: '{count} 页无法渲染',
    pdf_empty: '还没有可预览的页面。',
    pdf_failed: 'PDF 预览渲染失败。',
    pdf_zoom: '打开整页',
    select_page: '选择第 {index} 页',
    select_page_hint: '选择第 {index} 页',
    page: '第 {index} 页',
    blank_badge: '空白',
    pdf_lazy_hint: '滚动以按需加载其余页面。',
  }
}

export { interpolate }
