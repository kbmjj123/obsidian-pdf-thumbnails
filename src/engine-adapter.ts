import { PdfPreviewEngine, createPdfPreviewBuilder } from '@kbmjj123/pdf-thumbnails-core'
import type { App, TFile } from 'obsidian'
import type { PdfThumbnailsSettings } from './settings'

/** Read the vault PDF and wrap it as a `File` for the core engine. */
export async function toFile(file: TFile, app: App): Promise<File> {
  const buf = await app.vault.readBinary(file)
  return new File([buf], file.name, { type: 'application/pdf' })
}

export async function createEngine(
  file: TFile,
  app: App,
  settings: PdfThumbnailsSettings,
): Promise<PdfPreviewEngine> {
  const pdfFile = await toFile(file, app)
  return new PdfPreviewEngine({
    files: () => [pdfFile],
    build: createPdfPreviewBuilder(),
    maxPages: () => settings.maxPages,
  })
}
