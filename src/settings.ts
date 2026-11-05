import { App, PluginSettingTab, Setting } from 'obsidian'
import type PdfThumbnailsPlugin from './main'
import { SITE_URL, t } from './i18n'

export interface PdfThumbnailsSettings {
  /** Override native ![[pdf]] embeds with a thumbnail grid. */
  overrideEmbeds: boolean
  /** Thumbnail grid columns. */
  columns: number
  /** Thumbnail width in px. */
  thumbWidth: number
  /** Pages rendered on first load. */
  maxPages: number
}

export const DEFAULT_SETTINGS: PdfThumbnailsSettings = {
  overrideEmbeds: true,
  columns: 3,
  thumbWidth: 160,
  maxPages: 12,
}

export interface SettingDef {
  key: keyof PdfThumbnailsSettings
  nameKey: string
  descKey: string
  type: 'boolean' | 'number'
}

export const SETTINGS: SettingDef[] = [
  { key: 'overrideEmbeds', nameKey: 'setting.overrideEmbeds.name', descKey: 'setting.overrideEmbeds.desc', type: 'boolean' },
  { key: 'columns', nameKey: 'setting.columns.name', descKey: 'setting.columns.desc', type: 'number' },
  { key: 'thumbWidth', nameKey: 'setting.thumbWidth.name', descKey: 'setting.thumbWidth.desc', type: 'number' },
  { key: 'maxPages', nameKey: 'setting.maxPages.name', descKey: 'setting.maxPages.desc', type: 'number' },
]

export class PdfThumbnailsSettingTab extends PluginSettingTab {
  plugin: PdfThumbnailsPlugin
  constructor(app: App, plugin: PdfThumbnailsPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }
  display(): void {
    const { containerEl } = this
    containerEl.empty()
    const about = containerEl.createDiv({ cls: 'pdf-thumbnails-footer' })
    about.appendText(t('settings.about') + ' ')
    about.createEl('a', { text: SITE_URL, href: SITE_URL, attr: { target: '_blank', rel: 'noopener noreferrer' } })
    containerEl.createEl('hr')
    for (const def of SETTINGS) {
      new Setting(containerEl)
        .setName(t(def.nameKey))
        .setDesc(t(def.descKey))
        .addText((text) => {
          if (def.type === 'number') {
            text.inputEl.type = 'number'
            text.setValue(String(this.plugin.settings[def.key]))
            text.onChange(async (v) => {
              const n = Number(v)
              if (Number.isFinite(n)) {
                ;(this.plugin.settings[def.key] as number) = n
                await this.plugin.saveSettings()
              }
            })
          }
          return text
        })
        .addToggle((toggle) => {
          if (def.type === 'boolean') {
            toggle.setValue(this.plugin.settings[def.key] as boolean).onChange(async (v) => {
              ;(this.plugin.settings[def.key] as boolean) = v
              await this.plugin.saveSettings()
            })
          }
          return toggle
        })
    }
  }
}
