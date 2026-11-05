import { DEFAULT_SETTINGS, SETTINGS } from '../settings'

describe('settings', () => {
  it('defaults: override on, 3 cols, 160 width, 12 pages', () => {
    expect(DEFAULT_SETTINGS.overrideEmbeds).toBe(true)
    expect(DEFAULT_SETTINGS.columns).toBe(3)
    expect(DEFAULT_SETTINGS.thumbWidth).toBe(160)
    expect(DEFAULT_SETTINGS.maxPages).toBe(12)
  })
  it('every SETTINGS key has a matching default field', () => {
    for (const def of SETTINGS) {
      expect(def.key in DEFAULT_SETTINGS).toBe(true)
      const v = (DEFAULT_SETTINGS as unknown as Record<string, unknown>)[def.key]
      expect(v === undefined || v === null).toBe(false)
    }
  })
  it('SETTINGS covers all four toggles', () => {
    const keys = SETTINGS.map((s) => s.key).sort()
    expect(keys).toEqual(['columns', 'maxPages', 'overrideEmbeds', 'thumbWidth'].sort())
  })
  it('SETTINGS carries a type discriminator for boolean vs number', () => {
    const byKey = Object.fromEntries(SETTINGS.map((s) => [s.key, s.type]))
    expect(byKey.overrideEmbeds).toBe('boolean')
    expect(byKey.columns).toBe('number')
    expect(byKey.thumbWidth).toBe('number')
    expect(byKey.maxPages).toBe('number')
  })
})
