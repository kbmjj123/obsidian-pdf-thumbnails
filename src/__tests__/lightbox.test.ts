import { openLightbox } from '../lightbox'
import type { PdfPreviewPageView } from '@kbmjj123/pdf-thumbnails-core'
import { DEFAULT_PREVIEW_TEXTS } from '@kbmjj123/pdf-thumbnails-core'

const pages: PdfPreviewPageView[] = [
  { pageNumber: 1, url: 'a', width: 100, height: 140 },
  { pageNumber: 2, url: 'b', width: 100, height: 140 },
  { pageNumber: 3, url: 'c', width: 100, height: 140 },
]

function imgSrc(): string {
  const el = document.querySelector('.pdf-thumbnails-lightbox-img') as HTMLImageElement | null
  return el ? el.src : ''
}

describe('openLightbox', () => {
  afterEach(() => document.querySelectorAll('.pdf-thumbnails-lightbox').forEach((n) => n.remove()))

  it('opens at the start index', () => {
    openLightbox(pages, 1, DEFAULT_PREVIEW_TEXTS)
    expect(document.querySelector('.pdf-thumbnails-lightbox')).not.toBeNull()
    expect(imgSrc()).toContain('b')
  })
  it('next advances, clamps at end', () => {
    const close = openLightbox(pages, 0, DEFAULT_PREVIEW_TEXTS)
    ;(document.querySelector('.pdf-thumbnails-lightbox-next') as HTMLElement).click()
    expect(imgSrc()).toContain('b')
    ;(document.querySelector('.pdf-thumbnails-lightbox-next') as HTMLElement).click()
    expect(imgSrc()).toContain('c')
    ;(document.querySelector('.pdf-thumbnails-lightbox-next') as HTMLElement).click() // clamp
    expect(imgSrc()).toContain('c')
    close()
  })
  it('prev goes back and clamps at start', () => {
    openLightbox(pages, 2, DEFAULT_PREVIEW_TEXTS)
    ;(document.querySelector('.pdf-thumbnails-lightbox-prev') as HTMLElement).click()
    expect(imgSrc()).toContain('b')
    ;(document.querySelector('.pdf-thumbnails-lightbox-prev') as HTMLElement).click()
    expect(imgSrc()).toContain('a')
  })
  it('Esc and backdrop close', () => {
    const close = openLightbox(pages, 0, DEFAULT_PREVIEW_TEXTS)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(document.querySelector('.pdf-thumbnails-lightbox')).toBeNull()
    // backdrop
    openLightbox(pages, 0, DEFAULT_PREVIEW_TEXTS)
    ;(document.querySelector('.pdf-thumbnails-lightbox') as HTMLElement).click()
    expect(document.querySelector('.pdf-thumbnails-lightbox')).toBeNull()
    close()
  })
})
