import { useEffect, useMemo, useRef, useState } from 'react'
import type { RuntimeMusicTrack } from '@/editor/blocks/music/normalizeMusicTracks'

export interface PlaybackState {
  isPlaying: boolean
  shouldContinuePlaying: boolean
  currentTime: number
  duration: number
  bufferedTime: number
  volume: number
  isMuted: boolean
  hasPlaybackError: boolean
  activeTrackIndex: number
  isShuffleEnabled: boolean
}

export function clampTrackIndex(index: number, total: number): number {
  if (total <= 0) {
    return 0
  }
  if (index < 0) {
    return 0
  }
  if (index >= total) {
    return total - 1
  }
  return index
}

export function getAdjacentTrackIndex(current: number, total: number, direction: 'next' | 'prev'): number {
  const safeCurrent = clampTrackIndex(current, total)
  if (direction === 'next') {
    return Math.min(total - 1, safeCurrent + 1)
  }
  return Math.max(0, safeCurrent - 1)
}

export function resolveSelectedTrackIndex(index: number, total: number): number {
  if (!Number.isFinite(index)) {
    return 0
  }

  return clampTrackIndex(Math.round(index), total)
}

export function computeProgressRatio(currentTime: number, duration: number): number {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) {
    return 0
  }
  return Math.max(0, Math.min(currentTime / duration, 1))
}

export function resolveIsActuallyPlaying(stateIsPlaying: boolean, stateShouldContinuePlaying: boolean, isAudioPaused: boolean | undefined): boolean {
  if (stateShouldContinuePlaying) {
    return true
  }
  if (!stateIsPlaying) {
    return false
  }
  return isAudioPaused !== true
}

export function shouldAutoPlayOnTrackChange(shouldContinuePlaying: boolean): boolean {
  return shouldContinuePlaying
}

export function getShuffledTrackIndex(current: number, total: number, randomFn: () => number = Math.random): number {
  const safeCurrent = clampTrackIndex(current, total)
  if (total <= 1) {
    return safeCurrent
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = clampTrackIndex(Math.floor(randomFn() * total), total)
    if (candidate !== safeCurrent) {
      return candidate
    }
  }

  return (safeCurrent + 1) % total
}

export function resolveNextTrackIndex(current: number, total: number, isShuffleEnabled: boolean, randomFn: () => number = Math.random): number | null {
  if (total <= 1) {
    return null
  }

  if (isShuffleEnabled) {
    return getShuffledTrackIndex(current, total, randomFn)
  }

  const next = getAdjacentTrackIndex(current, total, 'next')
  return next === current ? null : next
}

export function useMusicPlayback(tracks: RuntimeMusicTrack[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const trackLoadTokenRef = useRef(0)
  const shouldContinueRef = useRef(false)

  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    shouldContinuePlaying: false,
    currentTime: 0,
    duration: 0,
    bufferedTime: 0,
    volume: 0.8,
    isMuted: false,
    hasPlaybackError: false,
    activeTrackIndex: 0,
    isShuffleEnabled: false,
  })

  const activeTrackIndex = clampTrackIndex(state.activeTrackIndex, tracks.length)
  const activeTrack = tracks[activeTrackIndex]
  const canGoPrev = tracks.length > 1 && (state.isShuffleEnabled || activeTrackIndex > 0)
  const canGoNext = tracks.length > 1 && (state.isShuffleEnabled || activeTrackIndex < tracks.length - 1)

  useEffect(() => {
    shouldContinueRef.current = state.shouldContinuePlaying
  }, [state.shouldContinuePlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !activeTrack?.src) {
      return
    }

    trackLoadTokenRef.current += 1
    const loadToken = trackLoadTokenRef.current

    audio.pause()
    audio.src = activeTrack.src
    audio.load()
    audio.currentTime = 0

    const shouldResume = shouldAutoPlayOnTrackChange(shouldContinueRef.current)
    if (!shouldResume) {
      return
    }

    audio.play()
      .then(() => {
        if (trackLoadTokenRef.current !== loadToken) {
          return
        }
        setState((current) => ({
          ...current,
          isPlaying: true,
          shouldContinuePlaying: true,
          hasPlaybackError: false,
        }))
      })
      .catch(() => {
        if (trackLoadTokenRef.current !== loadToken) {
          return
        }
        setState((current) => ({
          ...current,
          isPlaying: false,
          shouldContinuePlaying: false,
          hasPlaybackError: true,
        }))
      })
  }, [activeTrack?.src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }
    audio.volume = state.isMuted ? 0 : state.volume
  }, [state.isMuted, state.volume])

  useEffect(() => {
    if (!state.isPlaying || !audioRef.current) {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    const syncCurrentTime = () => {
      if (!audioRef.current) {
        return
      }
      setState((current) => ({ ...current, currentTime: audioRef.current?.currentTime ?? current.currentTime }))
      rafRef.current = window.requestAnimationFrame(syncCurrentTime)
    }

    rafRef.current = window.requestAnimationFrame(syncCurrentTime)
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [state.isPlaying])

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const api = useMemo(() => ({
    audioRef,
    state: {
      ...state,
      activeTrackIndex,
    },
    activeTrack,
    canGoPrev,
    canGoNext,
    setVolume(nextVolume: number) {
      if (!Number.isFinite(nextVolume)) {
        return
      }
      const clamped = Math.max(0, Math.min(nextVolume, 1))
      setState((current) => ({
        ...current,
        volume: clamped,
        isMuted: clamped <= 0.01,
      }))
    },
    toggleMute() {
      setState((current) => {
        if (current.isMuted || current.volume <= 0.01) {
          return {
            ...current,
            isMuted: false,
            volume: current.volume <= 0.01 ? 0.8 : current.volume,
          }
        }
        return {
          ...current,
          isMuted: true,
        }
      })
    },
    async togglePlay() {
      const audio = audioRef.current
      if (!audio) {
        return
      }

      if (!audio.paused) {
        audio.pause()
        shouldContinueRef.current = false
        setState((current) => ({ ...current, isPlaying: false, shouldContinuePlaying: false }))
        return
      }

      try {
        await audio.play()
        shouldContinueRef.current = true
        setState((current) => ({ ...current, isPlaying: true, shouldContinuePlaying: true, hasPlaybackError: false }))
      } catch {
        shouldContinueRef.current = false
        setState((current) => ({ ...current, isPlaying: false, shouldContinuePlaying: false, hasPlaybackError: true }))
      }
    },
    seek(nextTime: number) {
      const audio = audioRef.current
      if (!audio || !Number.isFinite(nextTime)) {
        return
      }
      audio.currentTime = nextTime
      setState((current) => ({ ...current, currentTime: nextTime }))
    },
    toggleShuffle() {
      setState((current) => ({
        ...current,
        isShuffleEnabled: !current.isShuffleEnabled,
      }))
    },
    prevTrack() {
      const prevIndex = state.isShuffleEnabled
        ? resolveNextTrackIndex(activeTrackIndex, tracks.length, true)
        : (activeTrackIndex > 0 ? getAdjacentTrackIndex(activeTrackIndex, tracks.length, 'prev') : null)
      if (prevIndex === null) {
        return
      }
      shouldContinueRef.current = state.shouldContinuePlaying || state.isPlaying
      setState((current) => ({
        ...current,
        activeTrackIndex: prevIndex,
        currentTime: 0,
        bufferedTime: 0,
        duration: 0,
        hasPlaybackError: false,
        shouldContinuePlaying: current.shouldContinuePlaying || current.isPlaying,
      }))
    },
    nextTrack() {
      const nextIndex = resolveNextTrackIndex(activeTrackIndex, tracks.length, state.isShuffleEnabled)
      if (nextIndex === null) {
        return
      }
      shouldContinueRef.current = state.shouldContinuePlaying || state.isPlaying
      setState((current) => ({
        ...current,
        activeTrackIndex: nextIndex,
        currentTime: 0,
        bufferedTime: 0,
        duration: 0,
        hasPlaybackError: false,
        shouldContinuePlaying: current.shouldContinuePlaying || current.isPlaying,
      }))
    },
    setActiveTrackIndex(index: number) {
      if (tracks.length === 0) {
        return
      }

      const nextIndex = resolveSelectedTrackIndex(index, tracks.length)
      shouldContinueRef.current = state.shouldContinuePlaying || state.isPlaying
      setState((current) => ({
        ...current,
        activeTrackIndex: nextIndex,
        currentTime: 0,
        bufferedTime: 0,
        duration: 0,
        hasPlaybackError: false,
        shouldContinuePlaying: current.shouldContinuePlaying || current.isPlaying,
      }))
    },
    onPlayStateChange(nextIsPlaying: boolean) {
      if (nextIsPlaying) {
        shouldContinueRef.current = true
      }
      setState((current) => ({
        ...current,
        isPlaying: nextIsPlaying,
        shouldContinuePlaying: nextIsPlaying ? true : current.shouldContinuePlaying,
      }))
    },
    onLoadedMetadata(duration: number) {
      if (!Number.isFinite(duration) || duration <= 0) {
        return
      }
      setState((current) => ({ ...current, duration, hasPlaybackError: false }))
    },
    onDurationChange(duration: number) {
      if (!Number.isFinite(duration) || duration <= 0) {
        return
      }
      setState((current) => ({ ...current, duration }))
    },
    onProgress(bufferedTime: number) {
      if (!Number.isFinite(bufferedTime) || bufferedTime < 0) {
        return
      }
      setState((current) => ({ ...current, bufferedTime }))
    },
    onTimeUpdate(currentTime: number) {
      if (!Number.isFinite(currentTime) || currentTime < 0) {
        return
      }
      setState((current) => ({ ...current, currentTime }))
    },
    onEnded() {
      const nextIndex = resolveNextTrackIndex(activeTrackIndex, tracks.length, state.isShuffleEnabled)
      if (nextIndex !== null) {
        shouldContinueRef.current = true
        setState((current) => ({
          ...current,
          activeTrackIndex: nextIndex,
          isPlaying: false,
          shouldContinuePlaying: true,
          currentTime: 0,
          bufferedTime: 0,
          duration: 0,
          hasPlaybackError: false,
        }))
        return
      }
      shouldContinueRef.current = false
      setState((current) => ({ ...current, isPlaying: false, shouldContinuePlaying: false, currentTime: 0 }))
    },
    onError() {
      shouldContinueRef.current = false
      setState((current) => ({ ...current, hasPlaybackError: true, isPlaying: false, shouldContinuePlaying: false }))
    },
  }), [activeTrack, activeTrackIndex, canGoNext, canGoPrev, state, tracks.length])

  return api
}
