import { processPdfEmbeds, resolvePdfFile } from '../embed-override'
import { makeMockApp } from './helpers'
import type { PdfThumbnailsSettings } from '../settings'

const settings: PdfThumbnailsSettings = {
  overrideEmbeds: true,
  columns: 3,
  thumbWidth: 160,
  maxPages: 12,
}

function makeRoot(path: string, cls = 'internal-embed'): { root: HTMLElement; embed: HTMLElement } {
  const root = document.createElement('div')
  const embed = root.createDiv({ cls })
  embed.setAttribute('data-path', path)
  return { root, embed }
}

function fakeEngine() {
  return {
    subscribe: () => () => {},
    getSnapshot: () => ({ total: 0 }),
    rebuild: () => {},
    ensure: () => {},
    dispose: () => {},
  }
}

const tick = () => new Promise((r) => setTimeout(r, 0))

describe('resolvePdfFile', () => {
  it('resolves a .pdf path to a TFile', () => {
    const app = makeMockApp({ 'doc.pdf': { path: 'doc.pdf', extension: 'pdf' } })
    const f = resolvePdfFile(app as never, 'doc.pdf')
    expect(f?.path).toBe('doc.pdf')
  })
  it('returns null for non-pdf', () => {
    const app = makeMockApp({ 'note.md': { path: 'note.md', extension: 'md' } })
    expect(resolvePdfFile(app as never, 'note.md')).toBeNull()
  })
})

describe('processPdfEmbeds', () => {
  it('mounts grid for a pdf embed when override is on', async () => {
    const app = makeMockApp({ 'doc.pdf': { path: 'doc.pdf', extension: 'pdf' } })
    const { root } = makeRoot('doc.pdf')
    const mounts: HTMLElement[] = []
    processPdfEmbeds(root, app as never, settings, {
      createEngine: async () => fakeEngine() as never,
      mount: (container) => {
        mounts.push(container)
        return { destroy() {} }
      },
    })
    await tick()
    expect(mounts.length).toBe(1)
    expect(mounts[0].getAttribute('data-path')).toBe('doc.pdf')
  })
  it('ignores non-pdf embeds', async () => {
    const app = makeMockApp({})
    const { root } = makeRoot('note.md')
    const mounts: HTMLElement[] = []
    processPdfEmbeds(root, app as never, settings, {
      createEngine: async () => fakeEngine() as never,
      mount: (container) => {
        mounts.push(container)
        return { destroy() {} }
      },
    })
    await tick()
    expect(mounts.length).toBe(0)
  })
  it('does nothing when override is off', async () => {
    const app = makeMockApp({ 'doc.pdf': { path: 'doc.pdf', extension: 'pdf' } })
    const { root } = makeRoot('doc.pdf')
    const mounts: HTMLElement[] = []
    processPdfEmbeds(root, app as never, { ...settings, overrideEmbeds: false }, {
      createEngine: async () => fakeEngine() as never,
      mount: (container) => {
        mounts.push(container)
        return { destroy() {} }
      },
    })
    await tick()
    expect(mounts.length).toBe(0)
  })
})
