import { act } from 'react'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { EditorialHero } from './EditorialHero'

describe('EditorialHero Component', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza o título cinético editorial e a badge comemorativa', async () => {
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <EditorialHero />
        </MemoryRouter>
      )
    })

    const text = container.textContent?.replace(/\s+/g, ' ') ?? ''
    expect(text).toContain('EDIÇÃO EXCLUSIVA • CORREIO ELEGANTE DIGITAL')
    expect(text).toContain('Mande um recado')
    expect(text).toContain('que faz sorrir')
  })

  it('renderiza os botões de ação e a composição do envelope 3D', async () => {
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <EditorialHero />
        </MemoryRouter>
      )
    })

    expect(container.textContent).toContain('Escrever minha carta')
    expect(container.textContent).toContain('Ver demonstração')
    expect(container.textContent).toContain('PAR AVION')
    expect(container.textContent).toContain('Nossa Trilha Sonora')
    expect(container.textContent).toContain('Toque para raspar o segredo')
  })

  it('permite interagir com a raspadinha para revelar a mensagem secreta', async () => {
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <EditorialHero />
        </MemoryRouter>
      )
    })

    const scratchBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Toque para raspar o segredo')
    )

    expect(scratchBtn).toBeDefined()

    await act(async () => {
      scratchBtn?.click()
    })

    expect(container.textContent).toContain('Nosso próximo destino é Paris')
  })
})
