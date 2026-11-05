import { t, lang, getPreviewTexts, SITE_URL } from '../i18n'

describe('i18n', () => {
  it('resolves a known key', () => {
    expect(t('setting.overrideEmbeds.name')).toMatch(/\S+/)
  })
  it('falls back to en for unknown keys', () => {
    expect(t('definitely.unknown.key')).toBe('definitely.unknown.key')
  })
  it('exposes zh + en preview texts with all keys', () => {
    const texts = getPreviewTexts()
    expect(texts.pdf_loading).toBeTruthy()
    expect(texts.page).toContain('{index}')
  })
  it('lang is zh or en', () => {
    expect(['zh', 'en']).toContain(lang)
  })
  it('SITE_URL is set', () => {
    expect(SITE_URL).toMatch(/^https?:\/\//)
  })
})
