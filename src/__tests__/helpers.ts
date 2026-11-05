import type { PdfPreviewPageView, PdfPreviewSnapshot } from '@kbmjj123/pdf-thumbnails-core'

export function makeSnapshot(pageNumbers: number[], urls: string[]): PdfPreviewSnapshot {
  const pages: PdfPreviewPageView[] = pageNumbers.map((n, i) => ({
    pageNumber: n,
    url: urls[i] ?? `url-${n}`,
    width: 100,
    height: 140,
  }))
  return {
    version: 1,
    total: pageNumbers.length,
    renderedCount: pages.length,
    loading: false,
    progress: null,
    errorCode: '',
    errorDetail: '',
    skipped: 0,
    pages,
    slotList: pages.map((p) => ({ pageNumber: p.pageNumber, view: p })),
  }
}

/** A minimal PdfPreviewEngine double for controller/override tests. */
export class FakeEngine {
  listeners = new Set<() => void>()
  snapshot: PdfPreviewSnapshot
  ensured: string[] = []
  rebuilt = 0
  constructor(initial: PdfPreviewSnapshot) {
    this.snapshot = initial
  }
  subscribe(cb: () => void) {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }
  getSnapshot() {
    return this.snapshot
  }
  rebuild() {
    this.rebuilt++
    this.emit()
  }
  ensure(r: string) {
    this.ensured.push(r)
  }
  dispose() {
    /* noop */
  }
  emit() {
    for (const l of this.listeners) l()
  }
}

export interface MockVault {
  getAbstractFileByPath: (p: string) => { path: string; extension: string } | null
  readBinary: (file: unknown) => Promise<ArrayBuffer>
}

export interface MockApp {
  vault: MockVault
}

export function makeMockApp(
  pathToFile: Record<string, { path: string; extension: string }>,
  binary: ArrayBuffer = new ArrayBuffer(8),
): MockApp {
  return {
    vault: {
      getAbstractFileByPath: (p: string) => pathToFile[p] ?? null,
      readBinary: () => Promise.resolve(binary),
    },
  }
}
