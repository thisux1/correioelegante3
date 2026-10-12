import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { TogetherCounterBlock } from './TogetherCounterBlock'
import type { Block, BlockComponentProps } from '@/editor/types'

function setInputValue(input: HTMLInputElement, value: string) {
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
  nativeSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function makeBlock(startDate: string, label?: string): Block {
  return {
    id: 'tc-1',
    type: 'togetherCounter',
    version: 1,
    props: { startDate, label },
    meta: { createdAt: Date.now(), updatedAt: Date.now() },
  }
}

describe('TogetherCounterBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('preview com data passada mostra anos, meses e dias decorridos', async () => {
    const start = new Date()
    start.setFullYear(start.getFullYear() - 2)
    const block = makeBlock(start.toISOString().slice(0, 10), 'Juntos há')

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TogetherCounterBlock, { block, mode: 'preview' }))
    })

    expect(container.textContent).toContain('Juntos há')
    expect(container.textContent).toMatch(/Anos?/)
    expect(container.textContent).toMatch(/Meses/)
    expect(container.textContent).toMatch(/Dias?/)
    expect(container.textContent).toContain('desde')
  })

  it('preview com data futura mostra contagem para o começo', async () => {
    const future = new Date(Date.now() + 30 * 86_400_000)
    const block = makeBlock(future.toISOString().slice(0, 10))

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TogetherCounterBlock, { block, mode: 'preview' }))
    })

    expect(container.textContent).toContain('Contagem para o começo')
    expect(container.textContent).not.toContain('desde')
  })

  it('preview sem data válida pede configuração', async () => {
    const block = makeBlock('data-invalida')

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TogetherCounterBlock, { block, mode: 'preview' }))
    })

    expect(container.textContent).toContain('Defina a data de início')
  })

  it('modo edição: data e legenda disparam onUpdate', async () => {
    const block = makeBlock('2020-03-14', 'Juntos há')
    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TogetherCounterBlock, { block, mode: 'edit', onUpdate }))
    })

    const dateInput = container.querySelector(
      'input[aria-label="Definir data de início do contador"]',
    ) as HTMLInputElement
    expect(dateInput).not.toBeNull()
    expect(dateInput.value).toBe('2020-03-14')

    await act(async () => {
      setInputValue(dateInput, '2021-06-01')
    })
    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'togetherCounter') {
      expect(updatedBlock.props.startDate).toBe('2021-06-01')
    }

    const labelInput = container.querySelector(
      'input[aria-label="Definir legenda do contador"]',
    ) as HTMLInputElement
    await act(async () => {
      setInputValue(labelInput, 'Nossa história começou há')
    })
    if (updatedBlock.type === 'togetherCounter') {
      expect(updatedBlock.props.label).toBe('Nossa história começou há')
    }
  })
})
