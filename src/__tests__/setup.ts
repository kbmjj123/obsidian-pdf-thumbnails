/**
 * jsdom polyfill for the DOM helpers Obsidian injects at runtime
 * (`createEl` / `createDiv` / `createSpan` / `setText` / `appendText` / `empty` / `setCssStyles`).
 *
 * Production code uses those helpers instead of `document.createElement`, so
 * unit tests running in jsdom need them to exist before anything renders.
 */
interface DomElementInfo {
  cls?: string | string[]
  text?: string | DocumentFragment
  attr?: Record<string, string | number | boolean | null>
  href?: string
  title?: string
  type?: string
  value?: string
  placeholder?: string
  parent?: HTMLElement
  [key: string]: unknown
}

type ElementInfo = DomElementInfo | string

function applyInfo(node: HTMLElement, info?: ElementInfo): void {
  if (!info) return
  const opts: DomElementInfo = typeof info === 'string' ? { cls: info } : info
  if (opts.cls) node.className = Array.isArray(opts.cls) ? opts.cls.join(' ') : opts.cls
  if (opts.text !== undefined) {
    node.textContent = typeof opts.text === 'string' ? opts.text : (opts.text.textContent ?? '')
  }
  if (opts.attr) {
    for (const [key, value] of Object.entries(opts.attr)) {
      if (value === null || value === false) continue
      node.setAttribute(key, String(value))
    }
  }
  if (opts.href !== undefined) node.setAttribute('href', opts.href)
  if (opts.title !== undefined) node.setAttribute('title', opts.title)
}

function createEl(tag: string, info?: ElementInfo, callback?: (el: HTMLElement) => void): HTMLElement {
  const node = document.createElement(tag)
  applyInfo(node, info)
  callback?.(node)
  const parent = typeof info === 'object' && info ? (info as DomElementInfo).parent : undefined
  if (parent) parent.appendChild(node)
  return node
}

function define(name: string, value: unknown, proto: unknown = HTMLElement.prototype): void {
  const target = proto as Record<string, unknown>
  if (typeof target[name] !== 'function') {
    Object.defineProperty(target, name, { value, writable: true, configurable: true })
  }
}

define('createEl', function (this: HTMLElement, tag: string, info?: ElementInfo, callback?: (el: HTMLElement) => void) {
  const node = createEl(tag, info, callback)
  this.appendChild(node)
  return node
})
define('createDiv', function (this: HTMLElement, info?: ElementInfo, callback?: (el: HTMLElement) => void) {
  return (this as HTMLElement & { createEl: typeof createEl }).createEl('div', info, callback)
})
define('createSpan', function (this: HTMLElement, info?: ElementInfo, callback?: (el: HTMLElement) => void) {
  return (this as HTMLElement & { createEl: typeof createEl }).createEl('span', info, callback)
})
define('setText', function (this: HTMLElement, val: string | DocumentFragment) {
  this.textContent = typeof val === 'string' ? val : (val.textContent ?? '')
})
define('appendText', function (this: HTMLElement, val: string) {
  this.appendChild(document.createTextNode(val))
}, Node.prototype)
define('empty', function (this: Node) {
  const node = this as unknown as Element
  while (node.firstChild) node.removeChild(node.firstChild)
}, Node.prototype)
define('setCssStyles', function (this: HTMLElement, styles: Record<string, string>) {
  for (const [k, v] of Object.entries(styles)) this.style.setProperty(k, v)
})
define('createEl', createEl, Document.prototype)
define('createDiv', (info?: ElementInfo, callback?: (el: HTMLDivElement) => void) => createEl('div', info, callback), Document.prototype)

const globals = globalThis as Record<string, unknown>
if (typeof globals.createEl !== 'function') {
  globals.createEl = createEl
  globals.createDiv = (info?: ElementInfo, callback?: (el: HTMLDivElement) => void) => createEl('div', info, callback)
  globals.createSpan = (info?: ElementInfo, callback?: (el: HTMLSpanElement) => void) => createEl('span', info, callback)
}
