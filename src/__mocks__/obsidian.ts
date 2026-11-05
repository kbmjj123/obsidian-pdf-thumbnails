/**
 * Minimal stub of the Obsidian API for unit tests.
 * `obsidian` ships types only; vitest aliases it here via vitest.config.ts.
 */

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
  registerMarkdownPostProcessor(): void {}
  loadData(): Promise<unknown> {
    return Promise.resolve(null)
  }
  saveData(): Promise<void> {
    return Promise.resolve()
  }
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

/** TFile-ish shape used by tests (also resolves the runtime `TFile` import from 'obsidian'). */
export class TFile {
  constructor(
    public path: string,
    public name: string,
    public basename: string,
    public extension: string,
  ) {}
}
