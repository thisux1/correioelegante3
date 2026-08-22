import { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { Ticker, DEFAULT_TICKER_ITEMS } from './Ticker'

describe('Ticker Component', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza os itens de destaque padrão do marquee', async () => {
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(<Ticker />)
    })

    for (const item of DEFAULT_TICKER_ITEMS) {
      expect(container.textContent).toContain(item)
    }
  })

  it('permite customizar a lista de itens e chamar callback onItemClick ao clicar', async () => {
    const onItemClick = vi.fn()
    const customItems = ['Item Teste A', 'Item Teste B']
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(<Ticker items={customItems} onItemClick={onItemClick} />)
    })

    expect(container.textContent).toContain('Item Teste A')
    expect(container.textContent).toContain('Item Teste B')

    const firstBtn = container.querySelector('button')
    expect(firstBtn).not.toBeNull()

    await act(async () => {
      firstBtn?.click()
    })

    expect(onItemClick).toHaveBeenCalledWith('Item Teste A')
  })
})
