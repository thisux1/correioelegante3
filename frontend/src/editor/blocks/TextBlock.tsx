import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
} from 'react'
import { stripHtml } from '@/editor/utils/htmlSanitizer'
import type { BlockComponentProps } from '@/editor/types'

function TextBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const editableRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const isTextBlock = block.type === 'text'
  const textValue = isTextBlock ? block.props.text : ''
  const alignValue = isTextBlock ? block.props.align : 'left'

  const alignClass =
    alignValue === 'center'
      ? 'text-center'
      : alignValue === 'right'
        ? 'text-right'
        : 'text-left'

  const isEmpty = textValue.trim().length === 0
  const showPlaceholder = isEmpty && !isFocused

  useEffect(() => {
    if (!isTextBlock || mode !== 'edit') {
      return
    }

    const node = editableRef.current
    if (!node || document.activeElement === node) {
      return
    }

    if (node.textContent !== textValue) {
      node.textContent = textValue
    }
  }, [isTextBlock, mode, textValue])

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

      const sanitizedText = stripHtml(event.currentTarget.innerHTML)

      if (event.currentTarget.textContent !== sanitizedText) {
        event.currentTarget.textContent = sanitizedText
      }

      if (!onUpdate || sanitizedText === textValue) {
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
            text: sanitizedText,
          },
        }
      })
    },
    [isTextBlock, onUpdate, textValue],
  )

  if (!isTextBlock) {
    return null
  }

  if (mode === 'preview') {
    return (
      <p className={`font-cursive text-xl leading-relaxed text-text ${alignClass}`}>
        {textValue}
      </p>
    )
  }

  return (
    <div
      className="relative rounded-2xl border border-dashed border-primary/30 bg-white/75 p-4"
      onClick={() => {
        editableRef.current?.focus()
      }}
    >
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`min-h-[3rem] whitespace-pre-wrap break-words font-cursive text-xl leading-relaxed text-text outline-none ${alignClass}`}
      />

      {showPlaceholder ? (
        <span
          className={`pointer-events-none absolute inset-x-4 top-4 font-cursive text-xl leading-relaxed text-text-light/70 ${alignClass}`}
        >
          Clique para escrever...
        </span>
      ) : null}
    </div>
  )
}

function areTextBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const TextBlock = memo(TextBlockComponent, areTextBlockPropsEqual)
