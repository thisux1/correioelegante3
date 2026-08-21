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
  Check,
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
    defaultSizeClass: 'text-2xl md:text-3xl leading-relaxed',
    defaultAlign: 'right',
    description: 'Caligrafia cursiva fluida para o remetente',
  },
}

export interface FontOptionItem {
  value: string
  name: string
  styleLabel: string
  samplePhrase: string
  fontFamily: string
}

const FONT_OPTIONS: FontOptionItem[] = [
  {
    value: '',
    name: 'Padrão do Tema',
    styleLabel: 'Tema Automático',
    samplePhrase: 'O amor nos pequenos detalhes',
    fontFamily: 'inherit',
  },
  {
    value: '"Dancing Script", "Brush Script MT", "Segoe Script", cursive',
    name: 'Dancing Script',
    styleLabel: 'Cursiva Romântica',
    samplePhrase: 'Com todo o meu afeto e carinho',
    fontFamily: '"Dancing Script", "Brush Script MT", "Segoe Script", cursive',
  },
  {
    value: '"Playfair Display", Georgia, "Times New Roman", serif',
    name: 'Playfair Display',
    styleLabel: 'Display Elegante',
    samplePhrase: 'Momentos inesquecíveis para sempre',
    fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif',
  },
  {
    value: '"EB Garamond", Garamond, "Times New Roman", serif',
    name: 'EB Garamond',
    styleLabel: 'Serifada Literária',
    samplePhrase: 'Histórias escritas no silêncio dos dias',
    fontFamily: '"EB Garamond", Garamond, "Times New Roman", serif',
  },
  {
    value: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    name: 'Outfit',
    styleLabel: 'Moderna Geométrica',
    samplePhrase: 'Design contemporâneo e vibrante',
    fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    value: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    name: 'Inter',
    styleLabel: 'Sem Serifa Limpa',
    samplePhrase: 'Clareza e legibilidade absoluta',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    value: '"Great Vibes", "Brush Script MT", "Segoe Script", cursive',
    name: 'Great Vibes',
    styleLabel: 'Caligráfica Nobre',
    samplePhrase: 'Eternamente seu, com todo amor',
    fontFamily: '"Great Vibes", "Brush Script MT", "Segoe Script", cursive',
  },
  {
    value: '"Caveat", "Segoe Print", "Brush Script MT", cursive',
    name: 'Caveat',
    styleLabel: 'Manuscrita Afetiva',
    samplePhrase: 'Um bilhete sincero guardado no peito',
    fontFamily: '"Caveat", "Segoe Print", "Brush Script MT", cursive',
  },
  {
    value: '"Merriweather", Georgia, "Times New Roman", serif',
    name: 'Merriweather',
    styleLabel: 'Clássica Editorial',
    samplePhrase: 'Aconchego para leituras profundas',
    fontFamily: '"Merriweather", Georgia, "Times New Roman", serif',
  },
  {
    value: '"Libre Baskerville", Georgia, "Times New Roman", serif',
    name: 'Libre Baskerville',
    styleLabel: 'Vintage Literária',
    samplePhrase: 'Atemporal como uma carta antiga',
    fontFamily: '"Libre Baskerville", Georgia, "Times New Roman", serif',
  },
  {
    value: '"Satisfy", "Brush Script MT", cursive',
    name: 'Satisfy',
    styleLabel: 'Cursiva Suave',
    samplePhrase: 'Doçura e fluidez em cada verso',
    fontFamily: '"Satisfy", "Brush Script MT", cursive',
  },
  {
    value: '"Kaushan Script", "Brush Script MT", cursive',
    name: 'Kaushan Script',
    styleLabel: 'Pincel Expressivo',
    samplePhrase: 'Expressivo e vibrante como a vida',
    fontFamily: '"Kaushan Script", "Brush Script MT", cursive',
  },
]

export interface FontSizeOptionItem {
  value: string
  code: string
  label: string
  pixelSize: string
  description: string
}

const FONT_SIZE_OPTIONS: FontSizeOptionItem[] = [
  { value: '', code: 'Auto', label: 'Padrão', pixelSize: 'Tema', description: 'Tamanho inteligente da categoria' },
  { value: '14px', code: 'P', label: 'Pequeno', pixelSize: '14px', description: 'Notas e detalhes sutis' },
  { value: '16px', code: 'M', label: 'Médio', pixelSize: '16px', description: 'Corpo de texto confortável' },
  { value: '18px', code: 'G', label: 'Grande', pixelSize: '18px', description: 'Destaque e subtítulos' },
  { value: '22px', code: 'GG', label: 'Extra Grande', pixelSize: '22px', description: 'Frases marcantes e citações' },
  { value: '28px', code: 'XG', label: 'Super Grande', pixelSize: '28px', description: 'Display e títulos de impacto' },
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
  const fontDropdownRef = useRef<HTMLDivElement>(null)
  const sizeDropdownRef = useRef<HTMLDivElement>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  const [isFocused, setIsFocused] = useState(false)
  const [showFontDropdown, setShowFontDropdown] = useState(false)
  const [showSizeDropdown, setShowSizeDropdown] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [selectionPosition, setSelectionPosition] = useState<SelectionToolbarPosition | null>(null)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
  })
  const [formatFeedback, setFormatFeedback] = useState<string | null>(null)
  const feedbackTimeoutRef = useRef<number | null>(null)

  const triggerFeedback = useCallback((msg: string) => {
    setFormatFeedback(msg)
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current)
    }
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFormatFeedback(null)
    }, 1400)
  }, [])

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

  const selectedFontOption = FONT_OPTIONS.find((opt) => opt.value === (props.fontFamily || ''))
  const selectedSizeOption = FONT_SIZE_OPTIONS.find((opt) => opt.value === (props.fontSize || ''))

  // Click outside detection for all custom dropdowns
  useEffect(() => {
    if (!showFontDropdown && !showSizeDropdown && !showColorPicker && !showHighlightPicker) {
      return
    }

    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(target)) {
        setShowFontDropdown(false)
      }
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(target)) {
        setShowSizeDropdown(false)
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(target)) {
        setShowColorPicker(false)
      }
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFontDropdown(false)
        setShowSizeDropdown(false)
        setShowColorPicker(false)
        setShowHighlightPicker(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDownOutside)
    document.addEventListener('touchstart', handlePointerDownOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside)
      document.removeEventListener('touchstart', handlePointerDownOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showColorPicker, showFontDropdown, showHighlightPicker, showSizeDropdown])

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

    // Position comfortably BELOW the selected text so native mobile OS context menus do not overlap
    const top = rangeRect.bottom - containerRect.top + 18
    const left = Math.max(
      8,
      Math.min(
        containerRect.width - 290,
        rangeRect.left - containerRect.left + rangeRect.width / 2 - 145,
      ),
    )

    setSelectionPosition({ top, left })

    if (typeof document !== 'undefined') {
      setActiveFormats({
        bold: Boolean(document.queryCommandState?.('bold')),
        italic: Boolean(document.queryCommandState?.('italic')),
        underline: Boolean(document.queryCommandState?.('underline')),
        strikeThrough: Boolean(document.queryCommandState?.('strikeThrough')),
      })
    }
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
    (command: string, value: string | undefined = undefined, label?: string) => {
      if (typeof document === 'undefined') {
        return
      }

      editableRef.current?.focus()
      document.execCommand(command, false, value)

      if (editableRef.current) {
        commitUpdate(editableRef.current.innerHTML)
      }

      const isBold = Boolean(document.queryCommandState?.('bold'))
      const isItalic = Boolean(document.queryCommandState?.('italic'))
      const isUnderline = Boolean(document.queryCommandState?.('underline'))
      const isStrike = Boolean(document.queryCommandState?.('strikeThrough'))

      setActiveFormats({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        strikeThrough: isStrike,
      })

      if (label) {
        triggerFeedback(label)
      } else {
        if (command === 'bold') triggerFeedback(isBold ? 'Negrito aplicado' : 'Negrito removido')
        if (command === 'italic') triggerFeedback(isItalic ? 'Itálico aplicado' : 'Itálico removido')
        if (command === 'underline') triggerFeedback(isUnderline ? 'Sublinhado aplicado' : 'Sublinhado removido')
        if (command === 'strikeThrough') triggerFeedback(isStrike ? 'Tachado aplicado' : 'Tachado removido')
      }

      updateSelectionToolbar()
    },
    [commitUpdate, triggerFeedback, updateSelectionToolbar],
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

      triggerFeedback('Destaque aplicado')
      setShowHighlightPicker(false)
      updateSelectionToolbar()
    },
    [commitUpdate, triggerFeedback, updateSelectionToolbar],
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
      className="relative overflow-visible rounded-2xl border border-border bg-surface-glass p-4 shadow-sm backdrop-blur-xs transition-all hover:border-primary/30"
    >
      {/* Category Tabs */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
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
                    ? 'bg-surface text-primary shadow-xs ring-1 ring-primary/20'
                    : 'text-text-light hover:bg-surface/60 hover:text-text'
                }`}
              >
                <Icon size={13} className={isSelected ? 'text-primary' : 'text-text-light'} />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Alignment quick toggles */}
        <div className="flex items-center rounded-lg border border-border bg-surface/80 p-0.5 shadow-2xs">
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

      {/* Discrete Typography Controls Header (Custom immersive Font & Size dropdowns) */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        {/* Custom Font Dropdown with rich visual preview */}
        <div ref={fontDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowFontDropdown((prev) => !prev)
              setShowSizeDropdown(false)
              setShowColorPicker(false)
            }}
            aria-haspopup="listbox"
            aria-expanded={showFontDropdown}
            aria-label="Selecionar Fonte"
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all ${
              showFontDropdown
                ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                : 'border-border bg-surface text-text hover:border-primary/40'
            }`}
          >
            <Type size={13} className="text-primary shrink-0" />
            <span className="max-w-[110px] truncate">{selectedFontOption?.name || 'Padrão do Tema'}</span>
            <ChevronDown
              size={12}
              className={`text-text-muted transition-transform ${showFontDropdown ? 'rotate-180 text-primary' : ''}`}
            />
          </button>

          {showFontDropdown && (
            <div
              role="listbox"
              aria-label="Lista de fontes disponíveis"
              className="absolute left-0 top-full mt-2 z-[100] w-72 sm:w-84 max-h-80 overflow-y-auto rounded-2xl border border-border bg-surface text-text p-2 shadow-2xl backdrop-blur-md"
            >
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-light/70">
                Tipografia & Estilos
              </p>
              {FONT_OPTIONS.map((opt) => {
                const isSelected = (props.fontFamily || '') === opt.value
                return (
                  <button
                    key={opt.name}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      handleFontChange(opt.value)
                      setShowFontDropdown(false)
                    }}
                    className={`group flex w-full flex-col rounded-xl p-2.5 text-left transition-all ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/20'
                        : 'hover:bg-primary/5 text-text'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">{opt.name}</span>
                        {isSelected && <Check size={12} className="text-primary" />}
                      </div>
                      <span className="text-[10px] text-text-light/80">{opt.styleLabel}</span>
                    </div>
                    <span
                      className="mt-0.5 truncate text-sm text-text/80 group-hover:text-primary transition-colors"
                      style={{ fontFamily: opt.fontFamily }}
                    >
                      {opt.samplePhrase}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Custom Font Size Dropdown with [P], [M], [G], [GG], [XG] options */}
        <div ref={sizeDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowSizeDropdown((prev) => !prev)
              setShowFontDropdown(false)
              setShowColorPicker(false)
            }}
            aria-haspopup="listbox"
            aria-expanded={showSizeDropdown}
            aria-label="Selecionar Tamanho"
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all ${
              showSizeDropdown
                ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                : 'border-border bg-surface text-text hover:border-primary/40'
            }`}
          >
            <span className="font-mono font-bold text-primary">
              {selectedSizeOption?.code === 'Auto' ? 'Tam: Auto' : `[${selectedSizeOption?.code || 'Auto'}]`}
            </span>
            <ChevronDown
              size={12}
              className={`text-text-muted transition-transform ${showSizeDropdown ? 'rotate-180 text-primary' : ''}`}
            />
          </button>

          {showSizeDropdown && (
            <div
              role="listbox"
              aria-label="Tamanhos de texto disponíveis"
              className="absolute left-0 top-full mt-2 z-[100] w-56 max-h-72 overflow-y-auto rounded-2xl border border-border bg-surface text-text p-2 shadow-2xl backdrop-blur-md"
            >
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-light/70">
                Tamanho do Texto
              </p>
              {FONT_SIZE_OPTIONS.map((opt) => {
                const isSelected = (props.fontSize || '') === opt.value
                return (
                  <button
                    key={opt.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      handleFontSizeChange(opt.value)
                      setShowSizeDropdown(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-all ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold ring-1 ring-primary/20'
                        : 'hover:bg-primary/5 text-text'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary w-8 text-left">
                        [{opt.code}]
                      </span>
                      <span className="font-medium">{opt.label}</span>
                    </div>
                    <span className="text-[11px] text-text-light">{opt.pixelSize}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Color Popover Button */}
        <div ref={colorPickerRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowColorPicker((prev) => !prev)
              setShowFontDropdown(false)
              setShowSizeDropdown(false)
            }}
            aria-label="Cor do Texto"
            title="Cor do Texto"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2 text-xs text-text transition-colors hover:border-primary/40"
          >
            <Palette size={13} className="text-primary" />
            <span
              className="h-3.5 w-3.5 rounded-full border border-border shadow-2xs"
              style={{ backgroundColor: props.color || 'var(--color-text)' }}
            />
            <ChevronDown size={11} className="text-text-muted" />
          </button>

          {showColorPicker ? (
            <div className="absolute left-0 top-full z-[100] mt-2 w-64 rounded-2xl border border-border bg-surface text-text p-3.5 shadow-2xl backdrop-blur-md">
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
                    className="h-8 w-8 rounded-xl border border-border transition-transform hover:scale-110 flex items-center justify-center"
                    style={{ backgroundColor: c.hex === 'transparent' ? 'transparent' : c.hex }}
                  >
                    {c.value === '' && <RotateCcw size={11} className="text-text-light" />}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <input
                  type="color"
                  value={props.color?.startsWith('#') ? props.color : '#e11d48'}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded-lg border border-border bg-transparent p-0"
                  aria-label="Seletor customizado de cor"
                />
                <span className="text-xs text-text-light">Cor customizada</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Block Quick Styles */}
        <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
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
      <div className="relative overflow-visible">
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          style={customStyles}
          className={`min-h-[4.5rem] whitespace-pre-wrap break-words rounded-xl border border-border bg-surface px-3.5 py-3 text-text outline-none transition-colors placeholder:text-text-light/50 focus-visible:ring-2 focus-visible:ring-primary/30 ${categoryConfig.defaultFontClass} ${categoryConfig.defaultSizeClass} ${alignClass}`}
          aria-label="Editor de texto do bloco"
        />

        {showPlaceholder ? (
          <span
            className={`pointer-events-none absolute inset-x-3.5 top-3 select-none leading-relaxed text-text-light/50 ${categoryConfig.defaultFontClass} ${categoryConfig.defaultSizeClass} ${alignClass}`}
          >
            {categoryConfig.placeholder}
          </span>
        ) : null}
      </div>

      {/* Floating Word/Medium Style Selection Micro-Toolbar (Positioned BELOW selection to avoid OS native menus) */}
      {selectionPosition && (
        <div
          style={{ top: `${selectionPosition.top}px`, left: `${selectionPosition.left}px` }}
          className="absolute z-[100] flex items-center gap-1 rounded-2xl border border-border bg-surface text-text px-2 py-1.5 shadow-2xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-150 ring-1 ring-border/50"
          onMouseDown={(e: ReactMouseEvent) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={() => executeFormat('bold')}
            aria-label="Negrito"
            title="Negrito (Ctrl+B)"
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
              activeFormats.bold
                ? 'bg-primary text-white font-bold shadow-xs scale-105 ring-2 ring-primary/40'
                : 'text-text hover:bg-primary/15 hover:text-primary active:scale-95'
            }`}
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeFormat('italic')}
            aria-label="Itálico"
            title="Itálico (Ctrl+I)"
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
              activeFormats.italic
                ? 'bg-primary text-white font-bold shadow-xs scale-105 ring-2 ring-primary/40'
                : 'text-text hover:bg-primary/15 hover:text-primary active:scale-95'
            }`}
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeFormat('underline')}
            aria-label="Sublinhado"
            title="Sublinhado (Ctrl+U)"
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
              activeFormats.underline
                ? 'bg-primary text-white font-bold shadow-xs scale-105 ring-2 ring-primary/40'
                : 'text-text hover:bg-primary/15 hover:text-primary active:scale-95'
            }`}
          >
            <Underline size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeFormat('strikeThrough')}
            aria-label="Tachado"
            title="Tachado"
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
              activeFormats.strikeThrough
                ? 'bg-primary text-white font-bold shadow-xs scale-105 ring-2 ring-primary/40'
                : 'text-text hover:bg-primary/15 hover:text-primary active:scale-95'
            }`}
          >
            <Strikethrough size={15} />
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Highlight Color Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHighlightPicker((prev) => !prev)}
              aria-label="Marca-texto / Destaque"
              title="Cor de Destaque"
              className="flex h-8 items-center gap-1 rounded-xl px-2 text-text transition-colors hover:bg-primary/15 hover:text-primary active:scale-95"
            >
              <Highlighter size={15} className="text-amber-500" />
              <ChevronDown size={11} className="text-text-muted" />
            </button>

            {showHighlightPicker && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 flex items-center gap-1.5 rounded-2xl border border-border bg-surface text-text p-2 shadow-2xl z-[100] backdrop-blur-md"
                onMouseDown={(e: ReactMouseEvent) => e.preventDefault()}
              >
                {HIGHLIGHT_COLORS.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    title={h.label}
                    onClick={() => applyHighlight(h.value)}
                    className="h-7 w-7 rounded-lg border border-border transition-transform hover:scale-120 active:scale-95"
                    style={{ backgroundColor: h.value }}
                  />
                ))}
                <button
                  type="button"
                  title="Remover destaque"
                  onClick={() => executeFormat('removeFormat', undefined, 'Formatação limpa')}
                  className="rounded-lg border border-border p-1.5 text-text-light hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Real-time Formatting Feedback Badge */}
          {formatFeedback && (
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/85 px-2 py-0.5 font-mono text-[11px] font-bold text-white shadow-md animate-in fade-in zoom-in-90 duration-150">
              ✓ {formatFeedback}
            </div>
          )}
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
