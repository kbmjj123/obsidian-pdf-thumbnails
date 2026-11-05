import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function readJson(p: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(__dirname, '..', '..', p), 'utf-8'))
}

describe('manifest/package version consistency', () => {
  it('manifest.json version equals package.json version', () => {
    const manifest = readJson('manifest.json')
    const pkg = readJson('package.json')
    expect(manifest.version).toBe(pkg.version)
  })
})
