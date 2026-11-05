import type { PdfPreviewSnapshot, PreviewTexts } from '@kbmjj123/pdf-thumbnails-core'
import { interpolate } from '@kbmjj123/pdf-thumbnails-core'

export interface GridRenderOptions {
  columns: number
  onPageClick: (pageNumber: number) => void
  texts: PreviewTexts
}

export function renderGrid(
  container: HTMLElement,
  snapshot: PdfPreviewSnapshot,
  opts: GridRenderOptions,
): void {
  container.empty()
  container.addClass('pdf-thumbnails-grid')
  container.style.setProperty('--pdf-cols', String(opts.columns))

  if (snapshot.total === 0 && !snapshot.loading) {
    const empty = container.createDiv({ cls: 'pdf-thumbnails-empty' })
    empty.setText(opts.texts.pdf_empty)
    return
  }

  for (const slot of snapshot.slotList) {
    const cell = container.createDiv({ cls: 'pdf-thumbnails-cell' })
    const label = cell.createDiv({ cls: 'pdf-thumbnails-page-label' })
    label.setText(interpolate(opts.texts.page, { index: slot.pageNumber }))
    if (slot.view) {
      const img = cell.createEl('img', { cls: 'pdf-thumbnails-img' })
      img.src = slot.view.url
      img.alt = interpolate(opts.texts.page, { index: slot.pageNumber })
      img.addEventListener('click', () => opts.onPageClick(slot.pageNumber))
    } else if (snapshot.loading) {
      cell.createDiv({ cls: 'pdf-thumbnails-placeholder' })
    }
  }

  if (snapshot.skipped > 0) {
    const note = container.createDiv({ cls: 'pdf-thumbnails-skipped' })
    note.setText(interpolate(opts.texts.pdf_skipped, { count: snapshot.skipped }))
  }
}
