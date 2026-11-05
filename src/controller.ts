import type { PdfPreviewEngine, PdfPreviewPageView, PreviewTexts } from '@kbmjj123/pdf-thumbnails-core'
import { renderGrid } from './grid'
import { openLightbox } from './lightbox'
import type { PdfThumbnailsSettings } from './settings'

/** Convert a scroll offset into a 1-based inclusive page range string. */
export function computeVisibleRange(
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number,
  total: number,
  buffer: number,
): string {
  if (rowHeight <= 0 || total <= 0) return `1-${Math.max(1, total)}`
  const first = Math.floor(scrollTop / rowHeight) + 1
  const visibleRows = Math.ceil(viewportHeight / rowHeight)
  const last = first + visibleRows - 1
  const lo = Math.max(1, first - buffer)
  const hi = Math.min(total, last + buffer)
  return `${lo}-${hi}`
}

export interface PdfThumbnailsHandle {
  destroy(): void
}

export function mountPdfThumbnails(
  container: HTMLElement,
  engine: PdfPreviewEngine,
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
