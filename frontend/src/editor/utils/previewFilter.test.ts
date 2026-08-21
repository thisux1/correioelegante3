import { describe, expect, it } from 'vitest'
import { createBlock } from '@/editor/utils/blockFactory'
import { filterPreviewBlocks } from '@/editor/utils/previewFilter'

describe('filterPreviewBlocks', () => {
  it('remove texto vazio do preview', () => {
    const text = createBlock('text')
    text.props.text = '   '

    const visible = filterPreviewBlocks([text])
    expect(visible).toHaveLength(0)
  })

  it('remove imagem vazia do preview', () => {
    const image = createBlock('image')
    image.props.src = ''

    const visible = filterPreviewBlocks([image])
    expect(visible).toHaveLength(0)
  })

  it('remove audio vazio do preview', () => {
    const music = createBlock('music')
    music.props.src = ''
    music.props.tracks = []

    const visible = filterPreviewBlocks([music])
    expect(visible).toHaveLength(0)
  })

  it('mantem audio no preview quando apenas tracks estao preenchidas', () => {
    const music = createBlock('music')
    music.props.src = ''
    music.props.assetId = undefined
    music.props.tracks = [{ src: 'https://cdn.example.com/song.mp3' }]

    const visible = filterPreviewBlocks([music])
    expect(visible).toHaveLength(1)
    expect(visible[0]?.type).toBe('music')
  })

  it('mantem apenas blocos com conteudo util', () => {
    const text = createBlock('text')
    text.props.text = 'Oi'

    const image = createBlock('image')
    image.props.src = 'https://example.com/image.jpg'

    const music = createBlock('music')
    music.props.src = ''

    const visible = filterPreviewBlocks([text, image, music])
    expect(visible).toHaveLength(2)
    expect(visible.map((block) => block.type)).toEqual(['text', 'image'])
  })

  it('mantem video com assetId mesmo sem src', () => {
    const video = createBlock('video')
    video.props.assetId = '507f1f77bcf86cd799439999'
    video.props.src = ''

    const visible = filterPreviewBlocks([video])
    expect(visible).toHaveLength(1)
    expect(visible[0]?.type).toBe('video')
  })

  it('filtra corretamente os novos blocos interativos', () => {
    const emptyTimeline = createBlock('timeline')
    emptyTimeline.props.items = []

    const validTimeline = createBlock('timeline')
    const envelope = createBlock('envelope')
    const scratch = createBlock('scratch')
    const quiz = createBlock('quiz')
    const polaroid = createBlock('polaroid')

    const emptyQuiz = createBlock('quiz')
    emptyQuiz.props.question = ''

    const visible = filterPreviewBlocks([
      emptyTimeline,
      validTimeline,
      envelope,
      scratch,
      quiz,
      emptyQuiz,
      polaroid,
    ])

    expect(visible).toHaveLength(5)
    expect(visible.map((b) => b.type)).toEqual([
      'timeline',
      'envelope',
      'scratch',
      'quiz',
      'polaroid',
    ])
  })
})
