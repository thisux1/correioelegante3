import { describe, expect, it, vi } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { SyncedLyricsView } from './SyncedLyricsView'

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

describe('SyncedLyricsView', () => {
  const sampleLrc = `[00:00.00]Primeira linha da canção
[00:05.00]Segunda linha apaixonada
[00:10.00]Terceira linha comovente
[00:15.00]Quarta linha de amor`

  it('retorna null se não houver letras', () => {
    const { host, unmount } = renderComponent(
      <SyncedLyricsView
        currentTime={0}
        onSeek={vi.fn()}
      />
    )
    expect(host.innerHTML).toBe('')
    unmount()
  })

  it('renderiza as 3 linhas integradas centradas na linha atual', () => {
    const { host, unmount } = renderComponent(
      <SyncedLyricsView
        syncedLyrics={sampleLrc}
        currentTime={6}
        onSeek={vi.fn()}
      />
    )

    // Linha 1 (anterior)
    expect(host.textContent).toContain('Primeira linha da canção')
    // Linha 2 (ativa)
    expect(host.textContent).toContain('Segunda linha apaixonada')
    // Linha 3 (seguinte)
    expect(host.textContent).toContain('Terceira linha comovente')
    // Quarta linha NÃO deve estar no trio atual
    expect(host.textContent).not.toContain('Quarta linha de amor')
    unmount()
  })

  it('dispara onSeek ao clicar em uma estrofe sincronizada', () => {
    const onSeekMock = vi.fn()
    const { host, unmount } = renderComponent(
      <SyncedLyricsView
        syncedLyrics={sampleLrc}
        currentTime={6}
        onSeek={onSeekMock}
      />
    )

    const buttons = host.querySelectorAll('button')
    const nextLineBtn = Array.from(buttons).find((b) => b.textContent?.includes('Terceira linha comovente'))

    expect(nextLineBtn).toBeDefined()
    act(() => {
      nextLineBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onSeekMock).toHaveBeenCalledWith(10)
    unmount()
  })
})
