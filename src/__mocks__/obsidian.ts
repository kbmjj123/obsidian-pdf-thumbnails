/**
 * Minimal stub of the Obsidian API for unit tests.
 * `obsidian` ships types only; vitest aliases it here via vitest.config.ts.
 */
import type { DomElementInfo } from 'obsidian'

export class Modal {
  contentEl = document.createElement('div')
  titleEl = document.createElement('div')
  constructor(public app: unknown) {}
  open(): void { this.onOpen() }
  onOpen(): void {}
  onClose(): void {}
  close(): void { this.onClose() }
}

export class Plugin {
  constructor(public app: unknown, public manifest: unknown) {}
  addCommand(): unknown { return {} }
  addSettingTab(): void {}
  registerEvent(): void {}
}

export class PluginSettingTab {
  containerEl = document.createElement('div')
  constructor(public app: unknown, public plugin: unknown) {}
  display(): void {}
}

export class Setting {
  constructor(public containerEl: HTMLElement) {}
  setName(name: string): this {
    const heading = document.createElement('div')
    heading.textContent = name
    this.containerEl.appendChild(heading)
    return this
  }
  setHeading(): this { return this }
}

export class Notice {
  constructor(public message: string) {}
}

/** Minimal Embed stub so embed-override tests can patch loadFile. */
export class Embed {
  containerEl: HTMLElement = document.createElement('div')
  linkpath = ''
  constructor(public app?: unknown) {}
  loadFile(): void {}
}

/** TFile-ish shape used by tests. */
export class TFile {
  constructor(
    public path: string,
    public name: string,
    public basename: string,
    public extension: string,
  ) {}
}
