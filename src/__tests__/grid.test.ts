import { renderGrid } from '../grid'
import { makeSnapshot } from './helpers'
import { DEFAULT_PREVIEW_TEXTS } from '@kbmjj123/pdf-thumbnails-core'

describe('renderGrid', () => {
  it('renders one cell per slot with an img using the page url', () => {
    const container = document.createElement('div')
    const snap = makeSnapshot([1, 2, 3], ['u1', 'u2', 'u3'])
    const clicked: number[] = []
    renderGrid(container, snap, {
      columns: 3,
      texts: DEFAULT_PREVIEW_TEXTS,
      onPageClick: (p) => clicked.push(p),
    })

    const cells = container.querySelectorAll('.pdf-thumbnails-cell')
    expect(cells.length).toBe(3)
    const imgs = container.querySelectorAll('.pdf-thumbnails-img')
    expect(imgs.length).toBe(3)
    expect((imgs[0] as HTMLImageElement).src).toContain('u1')

    imgs[1].dispatchEvent(new Event('click'))
    expect(clicked).toEqual([2])
  })

  it('shows empty message when no pages', () => {
    const container = document.createElement('div')
    const snap = makeSnapshot([], [])
    renderGrid(container, snap, {
      columns: 3,
      texts: DEFAULT_PREVIEW_TEXTS,
      onPageClick: () => {},
    })
    expect(container.querySelector('.pdf-thumbnails-empty')).not.toBeNull()
  })

  it('sets --pdf-cols css var from columns', () => {
    const container = document.createElement('div')
    renderGrid(container, makeSnapshot([1], ['u1']), {
      columns: 4,
      texts: DEFAULT_PREVIEW_TEXTS,
      onPageClick: () => {},
    })
    expect(container.style.getPropertyValue('--pdf-cols')).toBe('4')
  })
})
