import type { PdfPreviewPageView, PdfPreviewSnapshot, PreviewTexts } from '@kbmjj123/pdf-thumbnails-core'
import { renderGrid } from './grid'
import { openLightbox } from './lightbox'
import type { PdfThumbnailsSettings } from './settings'

/** Structural subset of the core engine the controller actually uses. */
export interface ThumbnailsEngine {
  subscribe(cb: () => void): () => void
  getSnapshot(): PdfPreviewSnapshot
  rebuild(): void
  ensure(range: string): void
  dispose(): void
}


/** Convert a scroll offset into a 1-based inclusive page range string. */
export function computeVisibleRange(
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number,
  total: number,
  buffer: number,
): string {
  if (rowHeight <= 0 || total <= 0) return `1-${Math.max(1, total)}`
  const firstVisible = Math.floor(scrollTop / rowHeight) + 1
  const lastVisible = firstVisible + Math.ceil(viewportHeight / rowHeight) - 1
  const lo = Math.max(1, Math.min(total, firstVisible - buffer))
  const hi = Math.min(total, Math.max(1, lastVisible + buffer))
  return `${lo}-${Math.max(lo, hi)}`
}

export interface PdfThumbnailsHandle {
  destroy(): void
}

export function mountPdfThumbnails(
  container: HTMLElement,
  engine: ThumbnailsEngine,
  settings: PdfThumbnailsSettings,
  texts: PreviewTexts,
): PdfThumbnailsHandle {
  const onClick = (pageNumber: number): void => {
    const snap = engine.getSnapshot()
    const idx = snap.pages.findIndex((p: PdfPreviewPageView) => p.pageNumber === pageNumber)
    if (idx >= 0) openLightbox(snap.pages, idx, texts)
  }

  const render = (): void => {
    renderGrid(container, engine.getSnapshot(), {
      columns: settings.columns,
      onPageClick: onClick,
      texts,
    })
  }

  const onScroll = (): void => {
    const snap = engine.getSnapshot()
    if (snap.total <= 0) return
    const first = snap.pages[0]
    const rowHeight = first
      ? Math.round((settings.thumbWidth * first.height) / first.width) + 24
      : 164
    const range = computeVisibleRange(
      container.scrollTop,
      container.clientHeight,
      rowHeight,
      snap.total,
      4,
    )
    engine.ensure(range)
  }

  const unsub = engine.subscribe(render)
  container.addEventListener('scroll', onScroll)
  engine.rebuild()
  render()

  return {
    destroy(): void {
      unsub()
      container.removeEventListener('scroll', onScroll)
      engine.dispose()
      container.empty()
    },
  }
}
