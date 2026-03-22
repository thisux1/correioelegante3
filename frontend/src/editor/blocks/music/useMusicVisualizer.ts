import { useEffect, useMemo, useRef, useState } from 'react'

function createDefaultBars(count: number): number[] {
  return new Array<number>(Math.max(1, count)).fill(0.15)
}

function createFallbackBars(tick: number, reducedMotion: boolean, barsCount: number): number[] {
  const defaultBars = createDefaultBars(barsCount)
  if (reducedMotion) {
    return defaultBars.map((_, index) => {
      const wave = (Math.sin((tick * 0.05) + index * 0.34) + 1) / 2
      return Math.max(0.06, Math.min(0.4, 0.12 + (wave * 0.22)))
    })
  }

  return defaultBars.map((_, index) => {
    const waveA = (Math.sin((tick * 0.09) + index * 0.65) + 1) / 2
    const waveB = (Math.sin((tick * 0.15) + index * 0.37) + 1) / 2
    const mixed = 0.15 + waveA * 0.45 + waveB * 0.3
    return Math.max(0.06, Math.min(1.0, mixed))
  })
}

interface UseMusicVisualizerParams {
  audioElement: HTMLAudioElement | null
  isPlaying: boolean
  barsCount?: number
  volume?: number
  isMuted?: boolean
}


type AudioContextCtor = typeof AudioContext

interface VisualizerGraphSuccess {
  mode: 'analyser'
  context: AudioContext
  analyser: AnalyserNode
  source: AudioNode
  gainNode: GainNode
}

interface VisualizerGraphFallback {
  mode: 'fallback'
}

export type VisualizerGraphSetup = VisualizerGraphSuccess | VisualizerGraphFallback

export function getAudioContextCtor(win: Window): AudioContextCtor | null {
  const globalCandidate = typeof AudioContext !== 'undefined' ? AudioContext : null
  const candidate = globalCandidate || (win as Window & { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
  return candidate ?? null
}

export function setupVisualizerGraph(audioElement: HTMLAudioElement, contextCtor: AudioContextCtor | null): VisualizerGraphSetup {
  if (!contextCtor) {
    return { mode: 'fallback' }
  }

  try {
    const context = new contextCtor()
    const analyser = context.createAnalyser()
    analyser.fftSize = 128
    analyser.smoothingTimeConstant = 0.85

    const source = context.createMediaElementSource(audioElement)
    const gainNode = context.createGain()

    source.connect(analyser)
    analyser.connect(gainNode)
    gainNode.connect(context.destination)

    return {
      mode: 'analyser',
      context,
      analyser,
      source,
      gainNode,
    }
  } catch {
    return { mode: 'fallback' }
  }
}

export function useMusicVisualizer({ audioElement, isPlaying, barsCount = 16, volume = 1, isMuted = false }: UseMusicVisualizerParams) {
  const [bars, setBars] = useState<number[]>(() => createDefaultBars(barsCount))
  const [isFallback, setIsFallback] = useState(false)

  const rafRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const fallbackTickRef = useRef(0)
  const isPlayingRef = useRef(isPlaying)
  const barsCountRef = useRef(barsCount)
  const volumeRef = useRef(volume)
  const isMutedRef = useRef(isMuted)
  const hasStartedPlaying = isPlaying || (audioElement?.currentTime ?? 0) > 0

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    volumeRef.current = volume
    isMutedRef.current = isMuted
    if (gainRef.current) {
      gainRef.current.gain.value = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  useEffect(() => {
    barsCountRef.current = barsCount
    setBars((currentBars) => {
      // Mantenha as barras limpas quando resize acontece silenciosamente se nao estiver tocando
      if (!isPlayingRef.current) return createDefaultBars(barsCount)
      return currentBars.length === barsCount ? currentBars : createDefaultBars(barsCount)
    })
  }, [barsCount])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const listener = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    mediaQuery.addEventListener('change', listener)
    return () => {
      mediaQuery.removeEventListener('change', listener)
    }
  }, [])

  const cleanup = useMemo(() => () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect()
      } catch {
        // noop
      }
      sourceRef.current = null
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect()
      } catch {
        // noop
      }
      analyserRef.current = null
    }

    if (gainRef.current) {
      try {
        gainRef.current.disconnect()
      } catch {
        // noop
      }
      gainRef.current = null
    }

    if (contextRef.current) {
      void contextRef.current.close().catch(() => undefined)
      contextRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  useEffect(() => {
    cleanup()

    if (!audioElement || !hasStartedPlaying) {
      return
    }

    fallbackTickRef.current = 0

    const runFallback = () => {
      setIsFallback(true)

      const fallbackLoop = () => {
        const currentBarsCount = barsCountRef.current
        if (!isPlayingRef.current) {
          setBars(createDefaultBars(currentBarsCount))
          rafRef.current = window.requestAnimationFrame(fallbackLoop)
          return
        }
        fallbackTickRef.current += 1
        setBars(createFallbackBars(fallbackTickRef.current, reducedMotion, currentBarsCount))
        rafRef.current = window.requestAnimationFrame(fallbackLoop)
      }

      fallbackLoop()
    }

    const graph = setupVisualizerGraph(audioElement, getAudioContextCtor(window))
    if (graph.mode === 'fallback') {
      runFallback()
      return
    }

    try {
      const { context, analyser, source, gainNode } = graph
      contextRef.current = context
      analyserRef.current = analyser
      sourceRef.current = source
      gainRef.current = gainNode

      // Set initial volume
      gainNode.gain.value = isMutedRef.current ? 0 : volumeRef.current

      const analyzerLoop = () => {
        const currentBarsCount = barsCountRef.current
        if (!isPlayingRef.current || isMutedRef.current || volumeRef.current === 0) {
          setBars(createDefaultBars(currentBarsCount))
          rafRef.current = window.requestAnimationFrame(analyzerLoop)
          return
        }

        const data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
        const step = Math.max(1, Math.floor(data.length / currentBarsCount))

        const nextBars = createDefaultBars(currentBarsCount).map((_, index) => {
          let sum = 0
          for (let offset = 0; offset < step; offset += 1) {
            sum += data[(index * step) + offset] ?? 0
          }
          const average = sum / step
          // Elevamos a curva para que volumes muito baixos fiquem visiveis, e o multiplicador de 1.8 joga pro teto 
          const baseRatio = average / 255
          const normalized = Math.pow(baseRatio, 0.65) * 1.2
          return Math.max(0.06, Math.min(1.0, normalized))
        })

        if (reducedMotion) {
          // No modo motion reduzido, a barra bate em 85% inves de 45%, senao o usuario acha que esta quebrado
          const dampedBars = nextBars.map((height) => Math.max(0.06, Math.min(0.85, 0.12 + (height * 0.7))))
          setBars(dampedBars)
        } else {
          setBars(nextBars)
        }
        rafRef.current = window.requestAnimationFrame(analyzerLoop)
      }

      if (context.state === 'suspended') {
        void context.resume().catch(() => undefined)
      }

      analyzerLoop()
    } catch {
      runFallback()
    }

    return () => {
      cleanup()
    }
  }, [audioElement, hasStartedPlaying, cleanup, reducedMotion])

  return {
    bars,
    isFallback,
  }
}
