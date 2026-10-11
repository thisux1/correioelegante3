import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { YoutubeBlock } from './YoutubeBlock'
import { extractYoutubeVideoId, buildYoutubeEmbedUrl } from './youtube'
import type { Block, BlockComponentProps, YoutubeBlockProps } from '@/editor/types'

const VIDEO_ID = 'dQw4w9WgXcQ'

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const isTextArea = input instanceof HTMLTextAreaElement
  const proto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  nativeSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function makeYoutubeBlock(props: Partial<YoutubeBlockProps>): Block {
  return {
    id: 'youtube-1',
    type: 'youtube',
    version: 1,
    props: {
      url: '',
      title: 'A nossa música',
      caption: 'Aperte o play e pense em nós dois.',
      ...props,
    },
    meta: { createdAt: Date.now(), updatedAt: Date.now() },
  }
}

describe('extractYoutubeVideoId', () => {
  it.each([
    ['watch', `https://www.youtube.com/watch?v=${VIDEO_ID}`],
    ['watch sem www', `https://youtube.com/watch?v=${VIDEO_ID}`],
    ['watch sem protocolo', `youtube.com/watch?v=${VIDEO_ID}`],
    ['watch com parametros extras', `https://www.youtube.com/watch?v=${VIDEO_ID}&t=42s&list=PLabc123`],
    ['watch com v depois de outro parametro', `https://www.youtube.com/watch?list=PLabc&v=${VIDEO_ID}&t=10`],
    ['youtu.be', `https://youtu.be/${VIDEO_ID}`],
    ['youtu.be sem protocolo', `youtu.be/${VIDEO_ID}`],
    ['youtu.be com timestamp', `https://youtu.be/${VIDEO_ID}?t=33`],
    ['shorts', `https://www.youtube.com/shorts/${VIDEO_ID}`],
    ['shorts com parametro', `https://www.youtube.com/shorts/${VIDEO_ID}?feature=share`],
    ['embed', `https://www.youtube.com/embed/${VIDEO_ID}`],
    ['embed nocookie', `https://www.youtube-nocookie.com/embed/${VIDEO_ID}`],
    ['live', `https://www.youtube.com/live/${VIDEO_ID}`],
    ['music', `https://music.youtube.com/watch?v=${VIDEO_ID}&list=RDAMVM`],
    ['mobile', `https://m.youtube.com/watch?v=${VIDEO_ID}`],
    ['legacy /v/', `https://www.youtube.com/v/${VIDEO_ID}`],
    ['ID puro colado', VIDEO_ID],
    ['com espacos ao redor', `   https://youtu.be/${VIDEO_ID}   `],
  ])('extrai o ID de %s', (_label, url) => {
    expect(extractYoutubeVideoId(url)).toBe(VIDEO_ID)
  })

  it.each([
    ['string vazia', ''],
    ['apenas espacos', '   '],
    ['texto qualquer', 'isso nao e um link'],
    ['URL de outro site', 'https://vimeo.com/12345678'],
    ['youtube sem video', 'https://www.youtube.com/'],
    ['watch sem parametro v', 'https://www.youtube.com/watch?list=PLabc'],
    ['watch com v invalido', 'https://www.youtube.com/watch?v=curto'],
    ['youtu.be sem id', 'https://youtu.be/'],
    ['canal do youtube', 'https://www.youtube.com/channel/UCxxxxxxxxxx'],
    ['id com tamanho errado', 'dQw4w9WgXc'],
  ])('retorna null para %s', (_label, url) => {
    expect(extractYoutubeVideoId(url)).toBeNull()
  })
})

describe('YoutubeBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza iframe no host youtube-nocookie com a URL de embed correta', async () => {
    const block = makeYoutubeBlock({
      url: `https://www.youtube.com/watch?v=${VIDEO_ID}&t=42s`,
      title: 'A nossa música',
      caption: 'Aperte o play e pense em nós dois.',
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(YoutubeBlock, { block, mode: 'preview' }))
    })

    const iframe = container.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.getAttribute('src')).toBe(buildYoutubeEmbedUrl(VIDEO_ID))
    expect(iframe?.getAttribute('src')).toContain('youtube-nocookie.com')
    expect(iframe?.getAttribute('src')).toContain(`/embed/${VIDEO_ID}`)
    expect(iframe?.getAttribute('loading')).toBe('lazy')
    expect(iframe?.getAttribute('title')).toBe('A nossa música')
    expect(container.textContent).toContain('A nossa música')
    expect(container.textContent).toContain('Aperte o play e pense em nós dois.')
  })

  it('nao renderiza inputs no modo preview', async () => {
    const block = makeYoutubeBlock({ url: `https://youtu.be/${VIDEO_ID}` })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(YoutubeBlock, { block, mode: 'preview' }))
    })

    expect(container.querySelector('input')).toBeNull()
    expect(container.querySelector('textarea')).toBeNull()
  })

  it('exibe estado vazio amigavel sem iframe quando a URL esta vazia', async () => {
    const block = makeYoutubeBlock({ url: '' })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(YoutubeBlock, { block, mode: 'preview' }))
    })

    expect(container.querySelector('iframe')).toBeNull()
    expect(container.textContent).toContain('Vídeo do YouTube ainda não configurado')
  })

  it('exibe estado vazio sem iframe quando o link nao e do YouTube', async () => {
    const block = makeYoutubeBlock({ url: 'https://vimeo.com/12345678' })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(YoutubeBlock, { block, mode: 'preview' }))
    })

    expect(container.querySelector('iframe')).toBeNull()
    expect(container.textContent).toContain('Vídeo do YouTube ainda não configurado')
  })

  it('omite o titulo quando esta vazio, mas mantem o player', async () => {
    const block = makeYoutubeBlock({
      url: `https://youtu.be/${VIDEO_ID}`,
      title: '',
      caption: '',
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(YoutubeBlock, { block, mode: 'preview' }))
    })

    expect(container.querySelector('iframe')).not.toBeNull()
    expect(container.querySelector('h3')).toBeNull()
  })

  it('em modo edicao, alterar a URL chama onUpdate com o novo link', async () => {
    const block = makeYoutubeBlock({ url: '' })

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(YoutubeBlock, { block, mode: 'edit', onUpdate }))
    })

    const urlInput = container.querySelector(
      'input[aria-label="Link do vídeo do YouTube"]',
    ) as HTMLInputElement
    expect(urlInput).not.toBeNull()

    const newUrl = `https://youtu.be/${VIDEO_ID}`
    await act(async () => {
      setInputValue(urlInput, newUrl)
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'youtube') {
      expect(updatedBlock.props.url).toBe(newUrl)
    }
  })

  it('em modo edicao, mostra feedback de link valido quando a URL e reconhecida', async () => {
    const block = makeYoutubeBlock({ url: `https://youtu.be/${VIDEO_ID}` })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(YoutubeBlock, { block, mode: 'edit' }))
    })

    expect(container.textContent).toContain('Link válido')
    // Preview leve: miniatura extraida, sem iframe de embed
    const thumbnail = container.querySelector('img')
    expect(thumbnail).not.toBeNull()
    expect(thumbnail?.getAttribute('src')).toContain(VIDEO_ID)
    expect(container.querySelector('iframe')).toBeNull()
  })

  it('em modo edicao, mostra orientacao quando o link nao e reconhecido', async () => {
    const block = makeYoutubeBlock({ url: 'https://vimeo.com/12345678' })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(YoutubeBlock, { block, mode: 'edit' }))
    })

    expect(container.textContent).toContain('Não reconhecemos esse link do YouTube')
    expect(container.querySelector('iframe')).toBeNull()
  })

  it('em modo edicao, titulo e legenda chamam onUpdate', async () => {
    const block = makeYoutubeBlock({
      url: `https://youtu.be/${VIDEO_ID}`,
      title: 'A nossa música',
      caption: 'Legenda antiga',
    })

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(YoutubeBlock, { block, mode: 'edit', onUpdate }))
    })

    const titleInput = container.querySelector(
      'input[aria-label="Título da dedicatória"]',
    ) as HTMLInputElement
    expect(titleInput).not.toBeNull()

    await act(async () => {
      setInputValue(titleInput, 'A música do nosso primeiro encontro')
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'youtube') {
      expect(updatedBlock.props.title).toBe('A música do nosso primeiro encontro')
    }

    const captionInput = container.querySelector(
      'input[aria-label="Legenda do vídeo"]',
    ) as HTMLInputElement
    expect(captionInput).not.toBeNull()

    await act(async () => {
      setInputValue(captionInput, 'Toda vez que toca, eu lembro de você.')
    })

    if (updatedBlock.type === 'youtube') {
      expect(updatedBlock.props.caption).toBe('Toda vez que toca, eu lembro de você.')
    }
  })

  it('retorna null quando o bloco nao e do tipo youtube', async () => {
    const block: Block = {
      id: 'quiz-1',
      type: 'quiz',
      version: 1,
      props: {
        question: 'Q?',
        yesButtonText: 'Sim',
        noButtonText: 'Não',
        successMessage: 'Ok',
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(YoutubeBlock, { block, mode: 'preview' }))
    })

    expect(container.innerHTML).toBe('')
  })
})
