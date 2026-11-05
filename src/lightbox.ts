import type { PdfPreviewPageView, PreviewTexts } from '@kbmjj123/pdf-thumbnails-core'

export function openLightbox(
  pages: PdfPreviewPageView[],
  startIndex: number,
  _texts: PreviewTexts,
): () => void {
  if (pages.length === 0) return () => undefined
  let index = Math.max(0, Math.min(startIndex, pages.length - 1))

  const overlay = document.createElement('div')
  overlay.addClass('pdf-thumbnails-lightbox')
  const img = overlay.createEl('img', { cls: 'pdf-thumbnails-lightbox-img' })
  const prev = overlay.createEl('button', {
    cls: 'pdf-thumbnails-lightbox-btn pdf-thumbnails-lightbox-prev',
    text: '‹',
  })
  const next = overlay.createEl('button', {
    cls: 'pdf-thumbnails-lightbox-btn pdf-thumbnails-lightbox-next',
    text: '›',
  })
  const closeBtn = overlay.createEl('button', {
    cls: 'pdf-thumbnails-lightbox-btn pdf-thumbnails-lightbox-close',
    text: '×',
  })

  const render = (): void => {
    img.src = pages[index].url
  }

  prev.addEventListener('click', (e) => {
    e.stopPropagation()
    index = Math.max(0, index - 1)
    render()
  })
  next.addEventListener('click', (e) => {
    e.stopPropagation()
    index = Math.min(pages.length - 1, index + 1)
    render()
  })
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    cleanup()
  })
  overlay.addEventListener('click', () => cleanup())

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') cleanup()
  }
  document.addEventListener('keydown', onKey)
  document.body.appendChild(overlay)
  render()

  function cleanup(): void {
    document.removeEventListener('keydown', onKey)
    overlay.remove()
  }
  return cleanup
}
