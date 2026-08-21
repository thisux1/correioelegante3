import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Palette,
  Type,
  Quote,
  PenTool,
  Heading,
  FileText,
  ChevronDown,
  RotateCcw,
} from 'lucide-react'
import { sanitizeHtml, stripHtml } from '@/editor/utils/htmlSanitizer'
import type {
  BlockComponentProps,
  TextBlockAlign,
  TextBlockCategory,
  TextBlockProps,
} from '@/editor/types'

interface CategoryConfig {
  id: TextBlockCategory
  label: string
  icon: typeof Heading
  placeholder: string
  defaultFontClass: string
  defaultSizeClass: string
  defaultAlign: TextBlockAlign
  description: string
}

const TEXT_CATEGORIES: Record<TextBlockCategory, CategoryConfig> = {
  title: {
    id: 'title',
    label: 'Título',
    icon: Heading,
    placeholder: 'Digite um título memorável...',
    defaultFontClass: 'font-display font-bold tracking-tight',
    defaultSizeClass: 'text-2xl md:text-3xl',
    defaultAlign: 'center',
    description: 'Display grande com destaque e impacto',
  },
  body: {
    id: 'body',
    label: 'Mensagem',
    icon: FileText,
    placeholder: 'Escreva sua mensagem com todo o carinho...',
    defaultFontClass: 'font-sans',
    defaultSizeClass: 'text-base md:text-lg leading-relaxed',
    defaultAlign: 'left',
    description: 'Leitura confortável para parágrafos e cartas',
  },
  quote: {
    id: 'quote',
    label: 'Citação',
    icon: Quote,
    placeholder: '“Escreva uma citação, poesia ou verso marcante...”',
    defaultFontClass: 'font-display italic',
    defaultSizeClass: 'text-lg md:text-xl',
    defaultAlign: 'center',
    description: 'Destaque estilizado com aspas clássicas',
  },
  signature: {
    id: 'signature',
    label: 'Assinatura',
    icon: PenTool,
    placeholder: 'Com todo o meu afeto, Seu Nome',
    defaultFontClass: 'font-cursive',
    defaultSizeClass: 'text-2xl md:text-3xl',
    defaultAlign: 'right',
    description: 'Caligrafia cursiva fluida para o remetente',
  },
}

const FONT_OPTIONS = [
  { value: '', label: 'Padrão do Tema' },
  { value: '"Dancing Script", "Brush Script MT", "Segoe Script", cursive', label: 'Dancing Script (Cursiva Romântica)' },
  { value: '"Playfair Display", Georgia, "Times New Roman", serif', label: 'Playfair Display (Display Elegante)' },
  { value: '"EB Garamond", Garamond, "Times New Roman", serif', label: 'EB Garamond (Serifada Literária)' },
  { value: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'Outfit (Moderna Geométrica)' },
  { value: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'Inter (Sem Serifa Limpa)' },
  { value: '"Great Vibes", "Brush Script MT", "Segoe Script", cursive', label: 'Great Vibes (Caligráfica Nobre)' },
  { value: '"Caveat", "Segoe Print", "Brush Script MT", cursive', label: 'Caveat (Manuscrita Afetiva)' },
  { value: '"Libre Baskerville", Georgia, "Times New Roman", serif', label: 'Libre Baskerville (Vintage)' },
  { value: '"Merriweather", Georgia, "Times New Roman", serif', label: 'Merriweather (Clássica Editorial)' },
  { value: '"Satisfy", "Brush Script MT", cursive', label: 'Satisfy (Cursiva Suave)' },
  { value: '"Kaushan Script", "Brush Script MT", cursive', label: 'Kaushan Script (Pincel Expressivo)' },
]

const FONT_SIZE_OPTIONS = [
  { value: '', label: 'Tamanho Padrão' },
  { value: '14px', label: 'P (14px)' },
  { value: '16px', label: 'M (16px)' },
  { value: '18px', label: 'G (18px)' },
  { value: '22px', label: 'GG (22px)' },
  { value: '28px', label: 'XG (28px)' },
  { value: '36px', label: '2XG (36px)' },
]

const COLOR_PALETTE = [
  { value: '', label: 'Cor do Tema (Padrão)', hex: 'transparent' },
  { value: 'var(--color-primary)', label: 'Primária do Tema', hex: '#e11d48' },
  { value: '#e11d48', label: 'Rosa Romance', hex: '#e11d48' },
  { value: '#be123c', label: 'Rubi Nobre', hex: '#be123c' },
  { value: '#d97706', label: 'Ouro Sunset', hex: '#d97706' },
  { value: '#059669', label: 'Esmeralda', hex: '#059669' },
  { value: '#4338ca', label: 'Índigo Noturno', hex: '#4338ca' },
  { value: '#7e22ce', label: 'Lavanda Intensa', hex: '#7e22ce' },
  { value: '#1f2937', label: 'Grafite Clássico', hex: '#1f2937' },
  { value: '#6b7280', label: 'Cinza Suave', hex: '#6b7280' },
]

const HIGHLIGHT_COLORS = [
  { value: '#fef08a', label: 'Amarelo Marca-texto' },
  { value: '#fbcfe8', label: 'Rosa Doce' },
  { value: '#e9d5ff', label: 'Lavanda' },
  { value: '#fed7aa', label: 'Pêssego' },
  { value: '#fecdd3', label: 'Rosa Choque' },
  { value: '#bae6fd', label: 'Azul Céu' },
  { value: '#bbf7d0', label: 'Menta' },
]

const ALIGN_CLASS_MAP: Record<TextBlockAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
}

interface SelectionToolbarPosition {
  top: number
  left: number
}

function TextBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editableRef = useRef<HTMLDivElement>(null)

  const [isFocused, setIsFocused] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [selectionPosition, setSelectionPosition] = useState<SelectionToolbarPosition | null>(null)

  const isTextBlock = block.type === 'text'
  const props: TextBlockProps = isTextBlock
    ? block.props
    : { text: '', category: 'body', align: 'left' }

  const category: TextBlockCategory = props.category || 'body'
  const categoryConfig = TEXT_CATEGORIES[category] || TEXT_CATEGORIES.body
  const align: TextBlockAlign = props.align || categoryConfig.defaultAlign
  const alignClass = ALIGN_CLASS_MAP[align] || 'text-left'

  const htmlContent = props.html ?? ''
  const textContent = props.text ?? ''
  const displayHtml = htmlContent || (textContent ? textContent.replace(/\n/g, '<br/>') : '')
  const isEmpty = (stripHtml(displayHtml) || textContent).trim().length === 0
  const showPlaceholder = isEmpty && !isFocused

  // Sync contentEditable with incoming props when not focused
  useEffect(() => {
    if (!isTextBlock || mode !== 'edit') {
      return
    }

    const node = editableRef.current
    if (!node || document.activeElement === node) {
      return
    }

    const currentInner = node.innerHTML
    if (displayHtml && currentInner !== displayHtml) {
      node.innerHTML = displayHtml
    } else if (!displayHtml && node.textContent) {
      node.innerHTML = ''
    }
  }, [displayHtml, isTextBlock, mode])

  // Track selection for Word/Medium style floating micro-toolbar
  const updateSelectionToolbar = useCallback(() => {
    if (mode !== 'edit' || !editableRef.current || !containerRef.current) {
      setSelectionPosition(null)
      return
    }

    const selection = window.getSelection()
    if (
      !selection
      || selection.isCollapsed
      || !selection.rangeCount
      || selection.toString().trim().length === 0
    ) {
      setSelectionPosition(null)
      return
    }

    const range = selection.getRangeAt(0)
    const node = editableRef.current

    if (!node.contains(range.commonAncestorContainer)) {
      setSelectionPosition(null)
      return
    }

    const rangeRect = range.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()

    const top = Math.max(8, rangeRect.top - containerRect.top - 48)
    const left = Math.max(
      10,
      Math.min(
        containerRect.width - 260,
        rangeRect.left - containerRect.left + rangeRect.width / 2 - 120,
      ),
    )

    setSelectionPosition({ top, left })
  }, [mode])

  useEffect(() => {
    const handleSelectionChange = () => {
      updateSelectionToolbar()
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [updateSelectionToolbar])

  // Helper to commit changes to block store
  const commitUpdate = useCallback(
    (newHtml: string, additionalProps?: Partial<TextBlockProps>) => {
      if (!onUpdate || !isTextBlock) {
        return
      }

      const sanitized = sanitizeHtml(newHtml)
      const plain = stripHtml(sanitized)

      onUpdate((currentBlock) => {
        if (currentBlock.type !== 'text') {
          return currentBlock
        }

        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            html: sanitized,
            text: plain,
            ...additionalProps,
          },
        }
      })
    },
    [isTextBlock, onUpdate],
  )

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!isTextBlock) {
        setIsFocused(false)
        return
      }

      setIsFocused(false)
      const currentHtml = event.currentTarget.innerHTML
      commitUpdate(currentHtml)
    },
    [commitUpdate, isTextBlock],
  )

  const handleInput = useCallback(() => {
    updateSelectionToolbar()
  }, [updateSelectionToolbar])

  // Formatting execution (Word/Medium inline tools)
  const executeFormat = useCallback(
    (command: string, value: string | undefined = undefined) => {
      if (typeof document === 'undefined') {
        return
      }

      editableRef.current?.focus()
      document.execCommand(command, false, value)

      if (editableRef.current) {
        commitUpdate(editableRef.current.innerHTML)
      }
      updateSelectionToolbar()
    },
    [commitUpdate, updateSelectionToolbar],
  )

  const applyHighlight = useCallback(
    (color: string) => {
      if (typeof document === 'undefined') {
        return
      }

      editableRef.current?.focus()
      const selection = window.getSelection()

      if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const mark = document.createElement('mark')
        mark.style.backgroundColor = color
        mark.style.color = 'inherit'
        mark.style.padding = '0.12em 0.3em'
        mark.style.borderRadius = '0.25rem'

        try {
          mark.appendChild(range.extractContents())
          range.insertNode(mark)
          selection.removeAllRanges()
          const newRange = document.createRange()
          newRange.selectNodeContents(mark)
          selection.addRange(newRange)
        } catch {
          document.execCommand('hiliteColor', false, color)
        }
      }

      if (editableRef.current) {
        commitUpdate(editableRef.current.innerHTML)
      }

      setShowHighlightPicker(false)
      updateSelectionToolbar()
    },
    [commitUpdate, updateSelectionToolbar],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.ctrlKey || event.metaKey) {
        const key = event.key.toLowerCase()
        if (key === 'b') {
          event.preventDefault()
          executeFormat('bold')
        } else if (key === 'i') {
          event.preventDefault()
          executeFormat('italic')
        } else if (key === 'u') {
          event.preventDefault()
          executeFormat('underline')
        }
      }
    },
    [executeFormat],
  )

  // Property updaters
  const handleCategoryChange = useCallback(
    (newCategory: TextBlockCategory) => {
      if (!onUpdate || !isTextBlock) {
        return
      }

      const nextConfig = TEXT_CATEGORIES[newCategory]
      onUpdate((currentBlock) => {
        if (currentBlock.type !== 'text') {
          return currentBlock
        }

        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            category: newCategory,
            // Align with default category alignment if not manually aligned differently
            align: currentBlock.props.align || nextConfig.defaultAlign,
          },
        }
      })
    },
    [isTextBlock, onUpdate],
  )

  const handleAlignChange = useCallback(
    (newAlign: TextBlockAlign) => {
      if (!onUpdate || !isTextBlock) {
        return
      }

      onUpdate((currentBlock) => {
        if (currentBlock.type !== 'text') {
          return currentBlock
        }

        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            align: newAlign,
          },
        }
      })
    },
    [isTextBlock, onUpdate],
  )

  const handleFontChange = useCallback(
    (fontFamily: string) => {
      if (!onUpdate || !isTextBlock) {
        return
      }

      onUpdate((currentBlock) => {
        if (currentBlock.type !== 'text') {
          return currentBlock
        }

        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            fontFamily: fontFamily || undefined,
          },
        }
      })
    },
    [isTextBlock, onUpdate],
  )

  const handleFontSizeChange = useCallback(
    (fontSize: string) => {
      if (!onUpdate || !isTextBlock) {
        return
      }

      onUpdate((currentBlock) => {
        if (currentBlock.type !== 'text') {
          return currentBlock
        }

        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            fontSize: fontSize || undefined,
          },
        }
      })
    },
    [isTextBlock, onUpdate],
  )

  const handleColorChange = useCallback(
    (color: string) => {
      if (!onUpdate || !isTextBlock) {
        return
      }

      onUpdate((currentBlock) => {
        if (currentBlock.type !== 'text') {
          return currentBlock
        }

        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            color: color || undefined,
          },
        }
      })
      setShowColorPicker(false)
    },
    [isTextBlock, onUpdate],
  )

  const handleToggleBlockStyle = useCallback(
    (styleKey: 'bold' | 'italic' | 'underline') => {
      if (!onUpdate || !isTextBlock) {
        return
      }

      onUpdate((currentBlock) => {
        if (currentBlock.type !== 'text') {
          return currentBlock
        }

        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            [styleKey]: !currentBlock.props[styleKey],
          },
        }
      })
    },
    [isTextBlock, onUpdate],
  )

  if (!isTextBlock) {
    return null
  }

  // Dynamic custom styles
  const customStyles: CSSProperties = {
    fontFamily: props.fontFamily || undefined,
    fontSize: props.fontSize || undefined,
    color: props.color || undefined,
    letterSpacing: props.letterSpacing || undefined,
    lineHeight: props.lineHeight || undefined,
    fontWeight: props.bold ? 'bold' : undefined,
    fontStyle: props.italic ? 'italic' : undefined,
    textDecoration: props.underline ? 'underline' : undefined,
  }

  // Preview Mode
  if (mode === 'preview') {
    const renderedHtml = sanitizeHtml(displayHtml)

    if (category === 'quote') {
      return (
        <blockquote className="relative my-2 rounded-2xl border-l-4 border-primary/40 bg-primary/[0.04] px-6 py-4 transition-colors">
          <span
            className="pointer-events-none absolute -top-3 left-2 font-serif text-4xl leading-none text-primary/20"
            aria-hidden="true"
          >
            “
          </span>
          <div
            className={`${categoryConfig.defaultFontClass} ${categoryConfig.defaultSizeClass} ${alignClass} text-text`}
            style={customStyles}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
          <span
            className="pointer-events-none absolute -bottom-4 right-3 font-serif text-4xl leading-none text-primary/20"
            aria-hidden="true"
          >
            ”
          </span>
        </blockquote>
      )
    }

    if (category === 'signature') {
      return (
        <div className={`mt-2 py-1 ${alignClass}`}>
          <div
            className={`inline-block ${categoryConfig.defaultFontClass} ${categoryConfig.defaultSizeClass} text-text ${alignClass}`}
            style={customStyles}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      )
    }

    if (category === 'title') {
      return (
        <h2
          className={`${categoryConfig.defaultFontClass} ${categoryConfig.defaultSizeClass} text-text ${alignClass}`}
          style={customStyles}
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      )
    }

    // Default 'body'
    return (
      <div
        className={`${categoryConfig.defaultFontClass} ${categoryConfig.defaultSizeClass} text-text ${alignClass}`}
        style={customStyles}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    )
  }

  // Edit Mode
  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl border border-primary/20 bg-white/90 p-4 shadow-sm backdrop-blur-xs transition-all hover:border-primary/30"
    >
      {/* Category Tabs */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 pb-3">
        <div
          role="tablist"
          aria-label="Categorias de texto"
          className="inline-flex rounded-xl bg-primary/[0.07] p-1 gap-1"
        >
          {(Object.keys(TEXT_CATEGORIES) as TextBlockCategory[]).map((catKey) => {
            const cat = TEXT_CATEGORIES[catKey]
            const isSelected = category === catKey
            const Icon = cat.icon

            return (
              <button
                key={catKey}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleCategoryChange(catKey)}
                title={cat.description}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white text-primary shadow-xs ring-1 ring-primary/20'
                    : 'text-text-light hover:bg-white/60 hover:text-text'
                }`}
              >
                <Icon size={13} className={isSelected ? 'text-primary' : 'text-text-light'} />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Alignment quick toggles */}
        <div className="flex items-center rounded-lg border border-primary/15 bg-white/80 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => handleAlignChange('left')}
            aria-label="Alinhar à esquerda"
            title="Alinhar à esquerda"
            className={`rounded p-1 text-text-light transition-colors hover:text-primary ${
              align === 'left' ? 'bg-primary/15 text-primary font-bold' : ''
            }`}
          >
            <AlignLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleAlignChange('center')}
            aria-label="Centralizar"
            title="Centralizar"
            className={`rounded p-1 text-text-light transition-colors hover:text-primary ${
              align === 'center' ? 'bg-primary/15 text-primary font-bold' : ''
            }`}
          >
            <AlignCenter size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleAlignChange('right')}
            aria-label="Alinhar à direita"
            title="Alinhar à direita"
            className={`rounded p-1 text-text-light transition-colors hover:text-primary ${
              align === 'right' ? 'bg-primary/15 text-primary font-bold' : ''
            }`}
          >
            <AlignRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleAlignChange('justify')}
            aria-label="Justificar texto"
            title="Justificar texto"
            className={`rounded p-1 text-text-light transition-colors hover:text-primary ${
              align === 'justify' ? 'bg-primary/15 text-primary font-bold' : ''
            }`}
          >
            <AlignJustify size={14} />
          </button>
        </div>
      </div>

      {/* Discrete Typography Controls Header */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        {/* Font Family selector */}
        <div className="relative inline-flex items-center">
          <Type size={13} className="pointer-events-none absolute left-2 text-text-muted" />
          <select
            value={props.fontFamily || ''}
            onChange={(e) => handleFontChange(e.target.value)}
            aria-label="Selecionar Fonte"
            className="h-8 rounded-lg border border-primary/20 bg-white pl-6 pr-6 text-xs text-text outline-none transition-colors hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/30 cursor-pointer"
          >
            {FONT_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size selector */}
        <select
          value={props.fontSize || ''}
          onChange={(e) => handleFontSizeChange(e.target.value)}
          aria-label="Selecionar Tamanho"
          className="h-8 rounded-lg border border-primary/20 bg-white px-2 text-xs text-text outline-none transition-colors hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/30 cursor-pointer"
        >
          {FONT_SIZE_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Color Popover Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker((prev) => !prev)}
            aria-label="Cor do Texto"
            title="Cor do Texto"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/20 bg-white px-2 text-xs text-text transition-colors hover:border-primary/40"
          >
            <Palette size={13} className="text-primary" />
            <span
              className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-2xs"
              style={{ backgroundColor: props.color || 'var(--color-text)' }}
            />
            <ChevronDown size={11} className="text-text-muted" />
          </button>

          {showColorPicker ? (
            <div className="absolute left-0 top-full z-30 mt-1 w-52 rounded-xl border border-primary/20 bg-white p-3 shadow-xl">
              <p className="mb-2 text-[11px] font-semibold text-text-light uppercase tracking-wider">
                Paleta de Cores
              </p>
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    title={c.label}
                    onClick={() => handleColorChange(c.value)}
                    className="h-7 w-7 rounded-lg border border-black/10 transition-transform hover:scale-110 flex items-center justify-center"
                    style={{ backgroundColor: c.hex === 'transparent' ? '#ffffff' : c.hex }}
                  >
                    {c.value === '' && <RotateCcw size={11} className="text-text-light" />}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
                <input
                  type="color"
                  value={props.color?.startsWith('#') ? props.color : '#e11d48'}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded-md border border-primary/20 bg-transparent p-0"
                  aria-label="Seletor customizado de cor"
                />
                <span className="text-xs text-text-light">Cor customizada</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Block Quick Styles */}
        <div className="flex items-center rounded-lg border border-primary/15 bg-white p-0.5">
          <button
            type="button"
            onClick={() => handleToggleBlockStyle('bold')}
            aria-label="Alternar Negrito no Bloco"
            title="Negrito no Bloco"
            className={`rounded p-1 transition-colors ${
              props.bold ? 'bg-primary/15 text-primary font-bold' : 'text-text-light hover:text-text'
            }`}
          >
            <Bold size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleToggleBlockStyle('italic')}
            aria-label="Alternar Itálico no Bloco"
            title="Itálico no Bloco"
            className={`rounded p-1 transition-colors ${
              props.italic ? 'bg-primary/15 text-primary italic' : 'text-text-light hover:text-text'
            }`}
          >
            <Italic size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleToggleBlockStyle('underline')}
            aria-label="Alternar Sublinhado no Bloco"
            title="Sublinhado no Bloco"
            className={`rounded p-1 transition-colors ${
              props.underline ? 'bg-primary/15 text-primary underline' : 'text-text-light hover:text-text'
            }`}
          >
            <Underline size={13} />
          </button>
        </div>
      </div>

      {/* Editable Container */}
      <div className="relative">
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          style={customStyles}
          className={`min-h-[4.5rem] whitespace-pre-wrap break-words rounded-xl border border-primary/20 bg-white px-3.5 py-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 ${categoryConfig.defaultFontClass} ${categoryConfig.defaultSizeClass} ${alignClass} text-text`}
          aria-label="Editor de texto do bloco"
        />

        {showPlaceholder ? (
          <span
            className={`pointer-events-none absolute inset-x-3.5 top-3 select-none leading-relaxed text-text-light/60 ${categoryConfig.defaultFontClass} ${categoryConfig.defaultSizeClass} ${alignClass}`}
          >
            {categoryConfig.placeholder}
          </span>
        ) : null}
      </div>

      {/* Floating Word/Medium Style Selection Micro-Toolbar */}
      {selectionPosition && (
        <div
          style={{ top: `${selectionPosition.top}px`, left: `${selectionPosition.left}px` }}
          className="absolute z-40 flex items-center gap-0.5 rounded-xl border border-primary/25 bg-white/95 px-1.5 py-1 shadow-xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-150"
          onMouseDown={(e: ReactMouseEvent) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={() => executeFormat('bold')}
            aria-label="Negrito"
            title="Negrito (Ctrl+B)"
            className="rounded-lg p-1.5 text-text hover:bg-primary/15 hover:text-primary transition-colors"
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            onClick={() => executeFormat('italic')}
            aria-label="Itálico"
            title="Itálico (Ctrl+I)"
            className="rounded-lg p-1.5 text-text hover:bg-primary/15 hover:text-primary transition-colors"
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            onClick={() => executeFormat('underline')}
            aria-label="Sublinhado"
            title="Sublinhado (Ctrl+U)"
            className="rounded-lg p-1.5 text-text hover:bg-primary/15 hover:text-primary transition-colors"
          >
            <Underline size={14} />
          </button>
          <button
            type="button"
            onClick={() => executeFormat('strikeThrough')}
            aria-label="Tachado"
            title="Tachado"
            className="rounded-lg p-1.5 text-text hover:bg-primary/15 hover:text-primary transition-colors"
          >
            <Strikethrough size={14} />
          </button>

          <div className="h-4 w-px bg-primary/20 mx-0.5" />

          {/* Highlight Color Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHighlightPicker((prev) => !prev)}
              aria-label="Marca-texto / Destaque"
              title="Cor de Destaque"
              className="rounded-lg p-1.5 text-text hover:bg-primary/15 hover:text-primary transition-colors flex items-center gap-1"
            >
              <Highlighter size={14} className="text-amber-500" />
              <ChevronDown size={10} className="text-text-muted" />
            </button>

            {showHighlightPicker && (
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 flex items-center gap-1 rounded-xl border border-primary/20 bg-white p-1.5 shadow-2xl z-50"
                onMouseDown={(e: ReactMouseEvent) => e.preventDefault()}
              >
                {HIGHLIGHT_COLORS.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    title={h.label}
                    onClick={() => applyHighlight(h.value)}
                    className="h-6 w-6 rounded-md border border-black/10 transition-transform hover:scale-115"
                    style={{ backgroundColor: h.value }}
                  />
                ))}
                <button
                  type="button"
                  title="Remover destaque"
                  onClick={() => executeFormat('removeFormat')}
                  className="rounded-md border border-primary/20 p-1 text-text-light hover:text-primary transition-colors"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function areTextBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return (
    prev.mode === next.mode
    && prev.block.meta.updatedAt === next.block.meta.updatedAt
    && JSON.stringify(prev.block.props) === JSON.stringify(next.block.props)
  )
}

export const TextBlock = memo(TextBlockComponent, areTextBlockPropsEqual)
