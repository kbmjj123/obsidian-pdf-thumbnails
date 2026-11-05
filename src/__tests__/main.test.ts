import { describe, it, expect, vi, beforeEach } from 'vitest'
import PdfThumbnailsPlugin from '../main'
import { uninstallEmbedOverride } from '../embed-override'

const app = { workspace: {}, vault: {} } as unknown as ConstructorParameters<typeof PdfThumbnailsPlugin>[0]
const manifest = { id: 'pdf-thumbnails' } as unknown as ConstructorParameters<typeof PdfThumbnailsPlugin>[1]

function makePlugin(savedData: Record<string, unknown> | null = null): PdfThumbnailsPlugin {
  const plugin = new PdfThumbnailsPlugin(app, manifest)
  if (savedData) {
    vi.spyOn(plugin, 'loadData').mockResolvedValue(savedData)
  }
  return plugin
}

describe('Plugin main', () => {
  beforeEach(() => {
    uninstallEmbedOverride()
  })

  it('onload loads settings, registers the setting tab, installs the embed override', async () => {
    const plugin = makePlugin()
    const regSpy = vi.spyOn(plugin, 'registerMarkdownPostProcessor')
    const tabSpy = vi.spyOn(plugin, 'addSettingTab')
    await plugin.onload()
    expect(regSpy).toHaveBeenCalledTimes(1)
    expect(tabSpy).toHaveBeenCalledTimes(1)
    expect(plugin.settings.overrideEmbeds).toBe(true)
    expect(plugin.settings.columns).toBe(3)
  })

  it('onload merges saved settings over defaults', async () => {
    const plugin = makePlugin({ columns: 5, maxPages: 4 })
    await plugin.onload()
    expect(plugin.settings.columns).toBe(5)
    expect(plugin.settings.maxPages).toBe(4)
    expect(plugin.settings.overrideEmbeds).toBe(true)
  })

  it('reinstalls the override after a prior uninstall', async () => {
    const first = makePlugin()
    await first.onload()
    first.onunload()
    const second = makePlugin()
    const regSpy = vi.spyOn(second, 'registerMarkdownPostProcessor')
    await second.onload()
    expect(regSpy).toHaveBeenCalledTimes(1)
  })
})
