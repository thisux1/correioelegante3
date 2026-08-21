import { describe, expect, it } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { Skeleton } from './Skeleton'

function renderComponent(ui: React.ReactElement) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = ReactDOM.createRoot(host)

  act(() => {
    root.render(ui)
  })

  return {
    host,
    unmount: () => {
      act(() => {
        root.unmount()
      })
      host.remove()
    },
  }
}

describe('Skeleton', () => {
  it('renderiza com variante rounded por padrão e classes de shimmer', () => {
    const { host, unmount } = renderComponent(<Skeleton data-testid="skeleton" />)
    const el = host.querySelector('[role="status"]') as HTMLElement

    expect(el).not.toBeNull()
    expect(el.getAttribute('aria-label')).toBe('Carregando...')
    expect(el.className).toContain('animate-shimmer')
    expect(el.className).toContain('rounded-2xl')
    unmount()
  })

  it('suporta variante text', () => {
    const { host, unmount } = renderComponent(<Skeleton variant="text" />)
    const el = host.querySelector('[role="status"]') as HTMLElement

    expect(el.className).toContain('h-4')
    expect(el.className).toContain('w-full')
    expect(el.className).toContain('rounded-md')
    unmount()
  })

  it('suporta variante circle', () => {
    const { host, unmount } = renderComponent(<Skeleton variant="circle" />)
    const el = host.querySelector('[role="status"]') as HTMLElement

    expect(el.className).toContain('rounded-full')
    expect(el.className).toContain('aspect-square')
    unmount()
  })

  it('suporta variante card', () => {
    const { host, unmount } = renderComponent(<Skeleton variant="card" />)
    const el = host.querySelector('[role="status"]') as HTMLElement

    expect(el.className).toContain('rounded-3xl')
    expect(el.className).toContain('border')
    unmount()
  })

  it('permite customizar com className adicional', () => {
    const { host, unmount } = renderComponent(
      <Skeleton variant="text" className="w-48 h-8 custom-test-class" />
    )
    const el = host.querySelector('[role="status"]') as HTMLElement

    expect(el.className).toContain('custom-test-class')
    expect(el.className).toContain('w-48')
    expect(el.className).toContain('h-8')
    unmount()
  })
})
