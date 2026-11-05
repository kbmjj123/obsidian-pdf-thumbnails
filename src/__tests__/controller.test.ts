import { mountPdfThumbnails, computeVisibleRange } from '../controller'
import { FakeEngine, makeSnapshot } from './helpers'
import { DEFAULT_PREVIEW_TEXTS } from '@kbmjj123/pdf-thumbnails-core'
import type { PdfThumbnailsSettings } from '../settings'

const settings: PdfThumbnailsSettings = {
  overrideEmbeds: true,
  columns: 3,
  thumbWidth: 160,
  maxPages: 12,
}

describe('computeVisibleRange', () => {
  it('maps scroll position to a 1-based page range', () => {
    expect(computeVisibleRange(0, 420, 140, 100, 4)).toBe('1-7')
    expect(computeVisibleRange(700, 420, 140, 100, 4)).toBe('2-12')
  })
  it('clamps to total', () => {
    expect(computeVisibleRange(100000, 420, 140, 10, 4)).toBe('10-10')
  })
})

describe('mountPdfThumbnails', () => {
  it('renders grid from initial snapshot and ensures more on scroll', () => {
    const container = document.createElement('div')
    const engine = new FakeEngine(makeSnapshot([1, 2, 3], ['a', 'b', 'c']))
    const handle = mountPdfThumbnails(container, engine, settings, DEFAULT_PREVIEW_TEXTS)
    expect(container.querySelectorAll('.pdf-thumbnails-cell').length).toBe(3)

    Object.defineProperty(container, 'scrollTop', { value: 700, configurable: true })
    Object.defineProperty(container, 'clientHeight', { value: 420, configurable: true })
    container.dispatchEvent(new Event('scroll'))
    expect(engine.ensured.length).toBeGreaterThan(0)
    handle.destroy()
    expect(engine.listeners.size).toBe(0)
  })
  it('opens lightbox on thumbnail click', () => {
    const container = document.createElement('div')
    const engine = new FakeEngine(makeSnapshot([1, 2], ['a', 'b']))
    mountPdfThumbnails(container, engine, settings, DEFAULT_PREVIEW_TEXTS)
    ;(container.querySelector('.pdf-thumbnails-img') as HTMLElement).click()
    expect(document.querySelector('.pdf-thumbnails-lightbox')).not.toBeNull()
    document.querySelectorAll('.pdf-thumbnails-lightbox').forEach((n) => n.remove())
  })
})
