import { vi } from 'vitest'
import { toFile, createEngine } from '../engine-adapter'
import { makeMockApp } from './helpers'
import type { PdfThumbnailsSettings } from '../settings'

// The real core engine spawns a pdf.js Web Worker, which cannot run under jsdom.
// Mock the module so createEngine builds a fake engine instead.
vi.mock('@kbmjj123/pdf-thumbnails-core', () => {
  class FakeEngine {
    opts: unknown
    constructor(opts: unknown) {
      this.opts = opts
    }
    subscribe(): () => void {
      return () => undefined
    }
    getSnapshot() {
      return {
        version: 1,
        total: 0,
        renderedCount: 0,
        loading: false,
        progress: null,
        errorCode: '',
        errorDetail: '',
        skipped: 0,
        pages: [],
        slotList: [],
      }
    }
    rebuild(): void {}
    ensure(): void {}
    dispose(): void {}
  }
  return {
    PdfPreviewEngine: FakeEngine,
    createPdfPreviewBuilder: () => async () => ({
      pages: [],
      total: 0,
      slotList: [],
      errorCode: '',
      errorDetail: '',
      skipped: 0,
    }),
  }
})

const settings: PdfThumbnailsSettings = {
  overrideEmbeds: true,
  columns: 3,
  thumbWidth: 160,
  maxPages: 12,
}

describe('engine-adapter', () => {
  it('toFile reads binary and wraps a PDF File', async () => {
    const binary = new TextEncoder().encode('%PDF-1.4 fake').buffer
    const app = makeMockApp({ 'doc.pdf': { path: 'doc.pdf', extension: 'pdf' } }, binary)
    const file = { path: 'doc.pdf', name: 'doc.pdf', basename: 'doc', extension: 'pdf' }
    const f = await toFile(file as never, app as never)
    expect(f.name).toBe('doc.pdf')
    expect(f.type).toBe('application/pdf')
  })
  it('createEngine returns an engine whose getSnapshot is callable', async () => {
    const app = makeMockApp({ 'doc.pdf': { path: 'doc.pdf', extension: 'pdf' } })
    const file = { path: 'doc.pdf', name: 'doc.pdf', basename: 'doc', extension: 'pdf' }
    const engine = await createEngine(file as never, app as never, settings)
    expect(typeof engine.getSnapshot).toBe('function')
    expect(typeof engine.subscribe).toBe('function')
    expect(engine.getSnapshot().total).toBe(0)
  })
})
