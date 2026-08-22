import { memo } from 'react'
import {
  Camera,
  Heart,
  ImageIcon,
  Music2,
  Play,
  Quote,
  Sparkles,
} from 'lucide-react'
import type {
  Block,
  BlockType,
  TextBlockCategory,
  TextBlockProps,
} from '@/editor/types'

export interface BlockSkeletonProps {
  block?: Block
  type?: BlockType
  category?: TextBlockCategory
  className?: string
}

function EnvelopeSkeleton({ recipientName }: { recipientName?: string }) {
  return (
    <div className="relative mx-auto w-full max-w-lg select-none px-2 py-4">
      <div className="relative mx-auto flex flex-col items-center">
        {/* Corpo do envelope com gradiente e borda */}
        <div className="relative z-20 w-full overflow-hidden rounded-3xl border border-amber-300/50 bg-gradient-to-b from-[#fbf4ea] via-[#f5e7d6] to-[#edd7bf] p-6 shadow-lg sm:p-8">
          {/* Textura e linhas diagonais de dobra simuladas */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(217,119,6,0.2) 25%, transparent 25%), linear-gradient(225deg, rgba(217,119,6,0.2) 25%, transparent 25%)',
              backgroundSize: '100% 100%',
            }}
          />

          <div className="relative z-10 flex flex-col items-center justify-between gap-5 py-3 text-center">
            {/* Destinatário */}
            <div className="w-full space-y-1.5 flex flex-col items-center">
              {recipientName ? (
                <div className="font-cursive text-2xl font-bold tracking-tight text-text/40 sm:text-3xl">
                  {recipientName}
                </div>
              ) : (
                <>
                  <div className="h-6 w-52 rounded-full bg-primary/20 animate-pulse sm:w-64" />
                  <div className="h-3 w-28 rounded-full bg-primary/10 animate-pulse" />
                </>
              )}
            </div>

            {/* Selo de cera central com brilho e inicial */}
            <div className="relative my-2">
              <div
                className="relative z-20 flex h-14 w-14 items-center justify-center rounded-full shadow-md animate-pulse"
                style={{
                  backgroundColor: '#e11d48',
                  boxShadow:
                    '0 6px 20px -2px rgba(225,29,72,0.5), inset 0 2px 4px rgba(255,255,255,0.45)',
                }}
              >
                <div className="absolute inset-1 rounded-full border border-white/40 border-dashed" />
                <Heart size={20} className="text-white/80" fill="currentColor" />
              </div>
            </div>

            {/* Linha decorativa de fechamento */}
            <div className="h-3 w-36 rounded-full bg-amber-900/10 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PolaroidSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-xs select-none px-4 py-6">
      <div className="relative mx-auto w-64 transform -rotate-2 rounded-2xl border border-primary/15 bg-white p-3.5 pb-6 shadow-xl transition-transform">
        {/* Washi Tape artesanal no topo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 bg-amber-100/80 shadow-xs backdrop-blur-xs z-20"
          style={{
            clipPath:
              'polygon(0% 5%, 5% 0%, 95% 0%, 100% 5%, 98% 95%, 95% 100%, 5% 100%, 0% 95%)',
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(245,158,11,0.2), rgba(245,158,11,0.2) 6px, transparent 6px, transparent 12px)',
          }}
        />

        {/* Área quadrada de foto em shimmer */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-tr from-rose-100/70 via-primary/10 to-amber-100/50 flex flex-col items-center justify-center animate-pulse">
          <Camera size={32} className="text-primary/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>

        {/* Linha de legenda manuscrita */}
        <div className="mt-4 flex flex-col items-center space-y-1.5 px-2">
          <div className="h-3.5 w-36 rounded-full bg-primary/20 animate-pulse" />
          <div className="h-2.5 w-20 rounded-full bg-primary/10 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function TimelineSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-2xl select-none px-4 py-6">
      {/* Linha vertical conectando os nós */}
      <div className="absolute bottom-8 left-9 top-8 w-0.5 bg-gradient-to-b from-primary/30 via-pink-300/40 to-amber-200/30 sm:left-1/2 sm:-ml-[1px]" />

      <div className="space-y-8">
        {/* Card 1 */}
        <div className="relative flex flex-col items-start gap-4 sm:flex-row">
          {/* Nó com coração */}
          <div className="absolute left-9 top-3 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-primary/30 text-primary shadow-md ring-4 ring-primary/15 sm:left-1/2">
            <Heart size={12} fill="currentColor" className="text-primary/70" />
          </div>

          {/* Card Esquerdo/Principal */}
          <div className="ml-14 w-[calc(100%-4rem)] sm:ml-0 sm:w-1/2 sm:pr-6">
            <div className="rounded-2xl border border-border bg-surface/95 p-4 shadow-md space-y-2.5">
              {/* Badge de Data */}
              <div className="h-5 w-24 rounded-full bg-primary/15 animate-pulse" />
              {/* Título */}
              <div className="h-4 w-40 rounded-md bg-primary/25 animate-pulse" />
              {/* Descrição */}
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-full rounded bg-primary/10 animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-primary/10 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 (Alternado no layout desktop) */}
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:flex-row-reverse">
          {/* Nó com coração */}
          <div className="absolute left-9 top-3 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-primary/30 text-primary shadow-md ring-4 ring-primary/15 sm:left-1/2">
            <Heart size={12} fill="currentColor" className="text-primary/70" />
          </div>

          {/* Card Direito */}
          <div className="ml-14 w-[calc(100%-4rem)] sm:ml-0 sm:w-1/2 sm:pl-6">
            <div className="rounded-2xl border border-border bg-surface/95 p-4 shadow-md space-y-2.5 sm:text-left">
              {/* Badge de Data */}
              <div className="h-5 w-28 rounded-full bg-primary/15 animate-pulse" />
              {/* Título */}
              <div className="h-4 w-36 rounded-md bg-primary/25 animate-pulse" />
              {/* Descrição */}
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-full rounded bg-primary/10 animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-primary/10 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuizSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-lg select-none px-2 py-4">
      <div className="relative mx-auto min-h-[260px] w-full overflow-hidden rounded-3xl border border-border bg-surface/90 p-7 text-center shadow-lg backdrop-blur-xs sm:p-9 space-y-6">
        {/* Ícone com coração pulsante */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner animate-pulse">
          <Heart size={28} fill="currentColor" className="text-primary/60" />
        </div>

        {/* Barra de Pergunta */}
        <div className="space-y-2 flex flex-col items-center">
          <div className="h-6 w-56 sm:w-72 rounded-full bg-primary/20 animate-pulse" />
          <div className="h-3.5 w-36 rounded-full bg-primary/10 animate-pulse" />
        </div>

        {/* Botões de Decisão (SIM / NÃO) */}
        <div className="relative flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Botão SIM */}
          <div className="inline-flex min-h-12 w-44 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-400/40 via-primary/40 to-pink-500/40 px-6 py-2.5 shadow-md animate-pulse">
            <Heart size={16} className="text-primary/40" fill="currentColor" />
            <div className="h-4 w-20 rounded-md bg-primary/30" />
          </div>

          {/* Botão NÃO */}
          <div className="inline-flex min-h-12 w-20 items-center justify-center rounded-2xl border border-border bg-surface-raised px-4 py-2.5 shadow-2xs animate-pulse">
            <div className="h-4 w-8 rounded bg-primary/20" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ScratchSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-md select-none px-2 py-4">
      <div className="relative min-h-[220px] w-full overflow-hidden rounded-2xl border border-border bg-surface/90 p-6 shadow-md flex flex-col items-center justify-center text-center space-y-3">
        {/* Textura de raspadinha metálica */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(225,29,72,0.2) 2px, transparent 2px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Ícone de brilho central */}
        <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary shadow-xs animate-pulse">
          <Sparkles size={22} className="text-primary/70" />
        </div>

        {/* Dica de raspar / barra de instrução */}
        <div className="relative z-10 space-y-2 flex flex-col items-center">
          <div className="h-4 w-52 rounded-full bg-primary/25 animate-pulse sm:w-60" />
          <div className="h-3 w-32 rounded-full bg-primary/15 animate-pulse" />
        </div>

        {/* Shimmer sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
      </div>
    </div>
  )
}

function TextSkeleton({
  category = 'body',
}: {
  category?: TextBlockCategory
}) {
  switch (category) {
    case 'title':
      return (
        <div className="relative mx-auto w-full max-w-xl select-none px-4 py-5 text-center space-y-3">
          <div className="h-8 w-3/4 max-w-md mx-auto rounded-xl bg-primary/25 animate-pulse" />
          <div className="h-4 w-1/2 max-w-xs mx-auto rounded-lg bg-primary/15 animate-pulse" />
        </div>
      )

    case 'quote':
      return (
        <div className="relative mx-auto w-full max-w-lg select-none px-4 py-5">
          <div className="relative rounded-2xl border border-border bg-surface/85 p-6 text-center shadow-xs space-y-3.5">
            <div className="mx-auto flex h-8 w-8 items-center justify-center text-primary/30">
              <Quote size={20} />
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-5 w-4/5 rounded-lg bg-primary/20 animate-pulse italic" />
              <div className="h-5 w-3/5 rounded-lg bg-primary/20 animate-pulse italic" />
            </div>
            <div className="h-3.5 w-28 mx-auto rounded-full bg-primary/15 animate-pulse pt-1" />
          </div>
        </div>
      )

    case 'signature':
      return (
        <div className="relative mx-auto w-full max-w-md select-none px-4 py-4 ml-auto">
          <div className="flex flex-col items-end space-y-2 text-right">
            <div className="h-7 w-48 rounded-xl bg-primary/20 animate-pulse" />
            <div className="h-3.5 w-32 rounded-md bg-primary/15 animate-pulse" />
          </div>
        </div>
      )

    case 'body':
    default:
      return (
        <div className="relative mx-auto w-full max-w-xl select-none px-4 py-4">
          <div className="rounded-2xl border border-border bg-surface/80 p-5 space-y-2.5 shadow-2xs">
            <div className="h-4 w-full rounded-md bg-primary/15 animate-pulse" />
            <div className="h-4 w-[92%] rounded-md bg-primary/15 animate-pulse" />
            <div className="h-4 w-[96%] rounded-md bg-primary/15 animate-pulse" />
            <div className="h-4 w-[60%] rounded-md bg-primary/15 animate-pulse" />
          </div>
        </div>
      )
  }
}

function ImageSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-xl select-none px-2 py-3">
      <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-xs flex flex-col items-center justify-center space-y-2">
        <ImageIcon size={36} className="text-primary/25 animate-pulse" />
        <div className="h-3 w-28 rounded-full bg-primary/15 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
      </div>
    </div>
  )
}

function GallerySkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-2xl select-none px-2 py-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-2xl border border-border bg-surface/90 shadow-xs">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-surface-raised flex flex-col items-center justify-center animate-pulse"
          >
            <ImageIcon size={22} className="text-primary/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  )
}

function TimerSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-lg select-none px-2 py-4">
      <div className="rounded-2xl border border-border bg-surface/90 p-5 shadow-xs space-y-4">
        {/* Rótulo / Legenda do timer */}
        <div className="h-4 w-36 mx-auto rounded-full bg-primary/15 animate-pulse" />

        {/* 4 Caixas de contagem regressiva */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {['Dias', 'Horas', 'Min', 'Seg'].map((label, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-surface-raised px-2 py-3 text-center space-y-1.5"
            >
              <div className="h-7 w-10 mx-auto rounded-lg bg-primary/20 animate-pulse" />
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-text-light/60 font-semibold">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MusicSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-lg select-none px-1 py-2">
      <div className="rounded-2xl border border-border bg-surface/95 p-3 shadow-sm flex items-center gap-3">
        {/* Capa Compacta */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-tr from-rose-200/60 to-primary/15 flex items-center justify-center text-primary/40 animate-pulse">
          <Music2 size={18} />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer pointer-events-none" />
        </div>

        {/* Título, Artista e Barra de Progresso Integrada */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="h-3.5 w-32 rounded-md bg-primary/25 animate-pulse" />
            <div className="h-2.5 w-14 rounded bg-primary/15 animate-pulse" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-primary/10 overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-primary/30 animate-pulse" />
          </div>
        </div>

        {/* Botão Play Compacto */}
        <div className="h-9 w-9 shrink-0 rounded-full bg-primary/25 shadow-xs flex items-center justify-center text-primary/50 animate-pulse">
          <Play size={16} fill="currentColor" />
        </div>
      </div>
    </div>
  )
}

function VideoSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-2xl select-none px-2 py-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-primary/20 bg-slate-900/10 shadow-md flex items-center justify-center">
        {/* Botão de play central */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/25 text-primary/50 backdrop-blur-xs shadow-lg animate-pulse">
          <Play size={28} fill="currentColor" />
        </div>

        {/* Barra de controles inferior */}
        <div className="absolute inset-x-0 bottom-0 flex h-10 items-center justify-between bg-black/25 px-4 backdrop-blur-xs">
          <div className="h-4 w-4 rounded-full bg-white/40" />
          <div className="h-1.5 w-3/5 rounded-full bg-white/25">
            <div className="h-full w-1/4 rounded-full bg-primary" />
          </div>
          <div className="h-3 w-12 rounded bg-white/30" />
        </div>
      </div>
    </div>
  )
}

function BlockSkeletonComponent({
  block,
  type: propType,
  category: propCategory,
  className = '',
}: BlockSkeletonProps) {
  const resolvedType: BlockType = (block?.type || propType || 'text') as BlockType

  const resolvedCategory: TextBlockCategory =
    block?.type === 'text'
      ? (block.props as TextBlockProps)?.category || 'body'
      : propCategory || 'body'

  const recipientName =
    block?.type === 'envelope' ? block.props.recipientName : undefined

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`w-full ${className}`}
      data-block-skeleton={resolvedType}
    >
      <span className="sr-only">Carregando bloco de {resolvedType}...</span>
      {resolvedType === 'envelope' && (
        <EnvelopeSkeleton recipientName={recipientName} />
      )}
      {resolvedType === 'polaroid' && <PolaroidSkeleton />}
      {resolvedType === 'timeline' && <TimelineSkeleton />}
      {resolvedType === 'quiz' && <QuizSkeleton />}
      {resolvedType === 'scratch' && <ScratchSkeleton />}
      {resolvedType === 'text' && (
        <TextSkeleton category={resolvedCategory} />
      )}
      {resolvedType === 'image' && <ImageSkeleton />}
      {resolvedType === 'gallery' && <GallerySkeleton />}
      {resolvedType === 'timer' && <TimerSkeleton />}
      {resolvedType === 'music' && <MusicSkeleton />}
      {resolvedType === 'video' && <VideoSkeleton />}
    </div>
  )
}

export const BlockSkeleton = memo(BlockSkeletonComponent)
