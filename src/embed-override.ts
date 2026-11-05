import { Plugin, TFile, type App } from 'obsidian'
import { createEngine } from './engine-adapter'
import { mountPdfThumbnails } from './controller'
import { getPreviewTexts } from './i18n'
import type { PdfThumbnailsSettings } from './settings'

/** Resolve a vault path (from an embed's `data-path`) to a PDF TFile, or null. */
export function resolvePdfFile(app: App, path: string): TFile | null {
  const file = app.vault.getAbstractFileByPath(path)
  if (file && (file as TFile).extension === 'pdf') return file as TFile
  return null
}

interface OverrideDeps {
  createEngine?: typeof createEngine
  mount?: (
    container: HTMLElement,
    engine: unknown,
    settings: PdfThumbnailsSettings,
  ) => { destroy(): void }
}

/** Replace any PDF internal embeds found under `root` with the thumbnail grid. */
export function processPdfEmbeds(
  root: HTMLElement,
  app: App,
  settings: PdfThumbnailsSettings,
  deps: OverrideDeps = {},
): void {
  if (!settings.overrideEmbeds) return
  const create = deps.createEngine ?? createEngine
  const mount =
    deps.mount ??
    ((container, engine, s) => mountPdfThumbnails(container, engine as never, s, getPreviewTexts()))
  const embeds = root.querySelectorAll<HTMLElement>('.internal-embed[data-path$=".pdf"]')
  for (const embedEl of Array.from(embeds)) {
    const path = embedEl.dataset.path ?? embedEl.getAttribute('data-path') ?? ''
    try {
      const file = resolvePdfFile(app, path)
      if (file) {
        embedEl.empty()
        void create(file, app, settings).then((engine) => mount(embedEl, engine, settings))
      }
    } catch (e) {
      // eslint-disable-next-line no-console -- surface override failure, leave native embed intact
      console.error('[pdf-thumbnails] override failed, leaving native embed', e)
    }
  }
}

let installed = false

/**
 * Register a markdown post-processor that overrides PDF embeds with the
 * thumbnail grid. `Embed` is not exported by the public API, so we hook the
 * post-processor (the robust, public alternative to monkey-patching internals).
 * Obsidian removes the post-processor automatically when the plugin unloads.
 */
export function installEmbedOverride(
  plugin: Plugin,
  getSettings: () => PdfThumbnailsSettings,
  deps: OverrideDeps = {},
): void {
  if (installed) return // idempotent
  installed = true
  plugin.registerMarkdownPostProcessor((el: HTMLElement) => {
    processPdfEmbeds(el, plugin.app, getSettings(), deps)
  })
}

export function uninstallEmbedOverride(): void {
  // Obsidian auto-removes plugin-registered post-processors on unload.
  installed = false
}
