import { Plugin } from 'obsidian'
import { DEFAULT_SETTINGS, type PdfThumbnailsSettings } from './settings'

export default class PdfThumbnailsPlugin extends Plugin {
  settings: PdfThumbnailsSettings = { ...DEFAULT_SETTINGS }

  async onload(): Promise<void> {
    // wire embed override + settings tab in Task 9
  }

  onunload(): void {
    // restore patched internals in Task 9
  }

  async loadSettings(): Promise<void> {
    const data = (await this.loadData()) as Partial<PdfThumbnailsSettings> | null
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {})
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }
}
