import { Embed, TFile, type App } from 'obsidian'
import { createEngine } from './engine-adapter'
import { mountPdfThumbnails } from './controller'
import { getPreviewTexts } from './i18n'
import type { PdfThumbnailsSettings } from './settings'

type AnyEmbed = Embed & { containerEl: HTMLElement; linkpath: string }

/** Resolve a vault path (from the embed's `data-path`) to a PDF TFile, or null. */
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

let originalLoadFile: ((this: AnyEmbed, ...args: unknown[]) => unknown) | null = null

export function installEmbedOverride(
  app: App,
  getSettings: () => PdfThumbnailsSettings,
  deps: OverrideDeps = {},
): void {
  if (originalLoadFile) return // idempotent
  const proto = Embed.prototype as unknown as {
    loadFile?: (this: AnyEmbed, ...a: unknown[]) => unknown
  }
  originalLoadFile = proto.loadFile as typeof originalLoadFile
  const create = deps.createEngine ?? createEngine
  const mount =
    deps.mount ??
    ((container, engine, settings) =>
      mountPdfThumbnails(container, engine as never, settings, getPreviewTexts()))

  proto.loadFile = function (this: AnyEmbed, ...args: unknown[]) {
    const settings = getSettings()
    const embedEl = this.containerEl as HTMLElement
    const path =
      embedEl?.dataset?.path ?? embedEl?.getAttribute('data-path') ?? this.linkpath ?? ''
    if (settings.overrideEmbeds && path.toLowerCase().endsWith('.pdf')) {
      try {
        const file = resolvePdfFile(app, path)
        if (file) {
          embedEl.empty()
          void create(file, app, settings).then((engine) => mount(embedEl, engine, settings))
          return
        }
      } catch (e) {
        // eslint-disable-next-line no-console -- surface override failure, then fall back
        console.error('[pdf-thumbnails] override failed, falling back to native embed', e)
      }
    }
    return originalLoadFile!.apply(this, args)
  }
}

export function uninstallEmbedOverride(): void {
  if (originalLoadFile) {
    const proto = Embed.prototype as unknown as { loadFile?: unknown }
    proto.loadFile = originalLoadFile
    originalLoadFile = null
  }
}
