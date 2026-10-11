import { memo, useCallback, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Flower2, Plus, RefreshCw, RotateCcw, Trash2 } from 'lucide-react'
import type {
  BlockComponentProps,
  BouquetBlockProps,
  BouquetFlower,
  BouquetSpecies,
  BouquetWrap,
} from '@/editor/types'
import { BOUQUET_SPECIES_VALUES } from '@/editor/types'
import { buildBouquetArt, MAX_FLOWERS } from './bouquet/layout'
import { SPECIES, SPECIES_LABELS, WRAP_LABELS } from './bouquet/sprites'
import { normalizeHex } from './bouquet/color'
import type { PixelRect } from './bouquet/pixels'

const WRAP_VALUES: readonly BouquetWrap[] = ['papel', 'juta', 'celofane']
const DEFAULT_RIBBON = '#e11d48'

function Rects({ rects, prefix }: { rects: PixelRect[]; prefix: string }) {
  return (
    <>
      {rects.map((r, i) => (
        <rect
          key={`${prefix}-${i}`}
          x={r.x}
          y={r.y}
          width={r.w}
          height={1}
          fill={r.color}
        />
      ))}
    </>
  )
}

function describeBouquet(flowers: BouquetFlower[]): string {
  if (flowers.length === 0) {
    return 'Embrulho de buquê em pixel art, ainda sem flores'
  }
  const counts = new Map<BouquetSpecies, number>()
  for (const f of flowers) {
    counts.set(f.species, (counts.get(f.species) ?? 0) + 1)
  }
  const parts = [...counts.entries()].map(
    ([species, count]) =>
      `${count} ${SPECIES_LABELS[species]}${count > 1 ? 's' : ''}`,
  )
  return `Buquê em pixel art com ${parts.join(', ')}`
}

function BouquetBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isBouquet = block.type === 'bouquet'
  const props: BouquetBlockProps = isBouquet
    ? block.props
    : { seed: 1, flowers: [] }

  const isEdit = mode === 'edit'
  const shouldReduceMotion = useReducedMotion()

  const art = useMemo(
    () =>
      buildBouquetArt({
        seed: props.seed,
        flowers: props.flowers ?? [],
        wrap: props.wrap,
        ribbonColor: props.ribbonColor,
      }),
    [props.seed, props.flowers, props.wrap, props.ribbonColor],
  )
  const flowers = props.flowers ?? []
  const wrap = props.wrap ?? 'papel'
  const ribbonColor = normalizeHex(props.ribbonColor ?? '') ?? DEFAULT_RIBBON
  const ariaLabel = describeBouquet(flowers)
  const bloom = !isEdit && !shouldReduceMotion

  const updateProp = useCallback(
    <K extends keyof BouquetBlockProps>(key: K, value: BouquetBlockProps[K]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'bouquet') return currentBlock
        return {
          ...currentBlock,
          props: { ...currentBlock.props, [key]: value },
        }
      })
    },
    [onUpdate],
  )

  const updateFlowers = useCallback(
    (updater: (current: BouquetFlower[]) => BouquetFlower[]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'bouquet') return currentBlock
        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            flowers: updater(currentBlock.props.flowers ?? []),
          },
        }
      })
    },
    [onUpdate],
  )

  const reseed = useCallback(() => {
    let next = Math.floor(Math.random() * 999_999) + 1
    if (next === props.seed) next = (next % 999_999) + 1
    updateProp('seed', next)
  }, [props.seed, updateProp])

  const addFlower = useCallback(() => {
    updateFlowers((current) =>
      current.length >= MAX_FLOWERS
        ? current
        : [
            ...current,
            { species: BOUQUET_SPECIES_VALUES[current.length % BOUQUET_SPECIES_VALUES.length] },
          ],
    )
  }, [updateFlowers])

  const removeFlower = useCallback(
    (index: number) => {
      updateFlowers((current) => current.filter((_, j) => j !== index))
    },
    [updateFlowers],
  )

  const setFlowerSpecies = useCallback(
    (index: number, species: BouquetSpecies) => {
      updateFlowers((current) =>
        current.map((f, j) => (j === index ? { ...f, species } : f)),
      )
    },
    [updateFlowers],
  )

  const setFlowerColor = useCallback(
    (index: number, color: string | undefined) => {
      updateFlowers((current) =>
        current.map((f, j) => {
          if (j !== index) return f
          const next: BouquetFlower = { species: f.species }
          if (color) next.color = color
          return next
        }),
      )
    },
    [updateFlowers],
  )

  if (!isBouquet) return null

  return (
    <div className="mx-auto w-full max-w-lg px-2 py-3 text-center" data-mode={mode}>
      <figure className="m-0">
        <motion.svg
          viewBox={`0 0 ${art.width} ${art.height}`}
          className="mx-auto h-auto w-full max-w-[300px] drop-shadow-sm"
          role="img"
          aria-label={ariaLabel}
          shapeRendering="crispEdges"
          style={{ imageRendering: 'pixelated' }}
          animate={
            bloom ? { scale: [1, 1.012, 1] } : undefined
          }
          transition={
            bloom
              ? { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
              : undefined
          }
          data-testid="bouquet-art"
        >
          <Rects rects={art.backRects} prefix="b" />
          <Rects rects={art.stemRects} prefix="s" />
          {art.flowers.map((f, i) => (
            <g key={`f${i}`} transform={f.transform} data-flower-head="">
              {bloom ? (
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.15 + f.order * 0.09,
                    type: 'spring',
                    stiffness: 300,
                    damping: 16,
                  }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                >
                  <Rects rects={f.rects} prefix={`f${i}`} />
                </motion.g>
              ) : (
                <g>
                  <Rects rects={f.rects} prefix={`f${i}`} />
                </g>
              )}
            </g>
          ))}
          <Rects rects={art.frontRects} prefix="w" />
        </motion.svg>

        {isEdit ? (
          <input
            type="text"
            value={props.message ?? ''}
            onChange={(e) => updateProp('message', e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Escreva uma dedicatória para o buquê…"
            aria-label="Mensagem do buquê"
            className="mt-1 w-full border-b border-dashed border-transparent bg-transparent px-2 py-1 text-center font-cursive text-2xl leading-snug text-text transition-colors placeholder:text-text-light/40 hover:border-primary/30 focus:border-primary focus:outline-none"
          />
        ) : (
          props.message && (
            <figcaption className="mt-1 font-cursive text-2xl leading-snug text-text">
              {props.message}
            </figcaption>
          )
        )}
      </figure>

      {isEdit && (
        <div
          className="mt-3 space-y-3 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Linha principal de controles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={reseed}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-primary/25 bg-surface px-4 font-bold text-primary shadow-xs transition-all hover:bg-primary hover:text-white active:scale-95"
            >
              <RefreshCw size={14} /> Gerar outro
            </button>

            <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-3 font-medium text-text-light">
              <span>Embrulho</span>
              <select
                value={wrap}
                onChange={(e) => updateProp('wrap', e.target.value as BouquetWrap)}
                aria-label="Estilo do embrulho"
                className="min-h-11 cursor-pointer bg-transparent font-semibold text-text focus:outline-none"
              >
                {WRAP_VALUES.map((w) => (
                  <option key={w} value={w}>
                    {WRAP_LABELS[w]}
                  </option>
                ))}
              </select>
            </label>

            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 font-medium text-text-light">
              <span>Laço</span>
              <input
                type="color"
                value={ribbonColor}
                onChange={(e) => updateProp('ribbonColor', e.target.value)}
                aria-label="Cor do laço"
                className="h-8 w-10 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
              />
            </label>

            <span className="ml-auto text-[10px] font-medium text-text-light/60">
              Seed {props.seed}
            </span>
          </div>

          {/* Flores do buquê */}
          <ul className="space-y-1.5" aria-label="Flores do buquê">
            {flowers.map((f, i) => (
              <li
                key={`flower-${i}`}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface/60 px-2 py-1.5"
              >
                <Flower2
                  size={15}
                  className="shrink-0 text-primary"
                  aria-hidden="true"
                />
                <select
                  value={f.species}
                  onChange={(e) =>
                    setFlowerSpecies(i, e.target.value as BouquetSpecies)
                  }
                  aria-label={`Espécie da flor ${i + 1}`}
                  className="min-h-11 flex-1 cursor-pointer bg-transparent text-sm font-medium text-text focus:outline-none"
                >
                  {BOUQUET_SPECIES_VALUES.map((s) => (
                    <option key={s} value={s}>
                      {SPECIES_LABELS[s]}
                    </option>
                  ))}
                </select>
                <input
                  type="color"
                  value={
                    normalizeHex(f.color ?? '') ??
                    SPECIES[f.species]?.petal ??
                    DEFAULT_RIBBON
                  }
                  onChange={(e) => setFlowerColor(i, e.target.value)}
                  aria-label={`Cor da flor ${i + 1}`}
                  className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-1"
                />
                <button
                  type="button"
                  onClick={() => setFlowerColor(i, undefined)}
                  disabled={!f.color}
                  aria-label={`Restaurar cor padrão da flor ${i + 1}`}
                  title="Restaurar cor padrão"
                  className="flex h-11 w-9 shrink-0 items-center justify-center rounded-lg text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-light"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeFlower(i)}
                  aria-label={`Remover flor ${i + 1}`}
                  title="Remover flor"
                  className="flex h-11 w-9 shrink-0 items-center justify-center rounded-lg text-text-light transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={addFlower}
            disabled={flowers.length >= MAX_FLOWERS}
            className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/35 bg-surface/60 px-4 text-sm font-bold text-primary transition-all hover:bg-primary/10 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={15} />
            {flowers.length >= MAX_FLOWERS
              ? `Máximo de ${MAX_FLOWERS} flores`
              : 'Adicionar flor'}
          </button>
        </div>
      )}
    </div>
  )
}

function areBouquetPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const BouquetBlock = memo(BouquetBlockComponent, areBouquetPropsEqual)
