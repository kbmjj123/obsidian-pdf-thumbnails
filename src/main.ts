import { Plugin } from 'obsidian'
import { DEFAULT_SETTINGS, PdfThumbnailsSettingTab, type PdfThumbnailsSettings } from './settings'
import { installEmbedOverride, uninstallEmbedOverride } from './embed-override'

export default class PdfThumbnailsPlugin extends Plugin {
  settings: PdfThumbnailsSettings = { ...DEFAULT_SETTINGS }

  async onload(): Promise<void> {
    await this.loadSettings()
    this.addSettingTab(new PdfThumbnailsSettingTab(this.app, this))
    installEmbedOverride(this, () => this.settings)
  }

  onunload(): void {
    uninstallEmbedOverride()
  }

  async loadSettings(): Promise<void> {
    const data = (await this.loadData()) as Partial<PdfThumbnailsSettings> | null
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {})
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }
}
