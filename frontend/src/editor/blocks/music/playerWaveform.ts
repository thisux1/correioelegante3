export const DESKTOP_WAVEFORM_BARS = 44
export const MOBILE_WAVEFORM_BARS = 25

export interface WaveformBarModel {
  heightRatio: number
  isPlayed: boolean
}

export function resolveWaveformBarsCount(viewportWidth: number): number {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return DESKTOP_WAVEFORM_BARS
  }
  return viewportWidth < 620 ? MOBILE_WAVEFORM_BARS : DESKTOP_WAVEFORM_BARS
}

export function resolveBarIndexFromClientX(clientX: number, rectLeft: number, rectWidth: number, barsCount: number): number {
  if (!Number.isFinite(clientX) || !Number.isFinite(rectLeft) || !Number.isFinite(rectWidth) || rectWidth <= 0 || barsCount <= 0) {
    return 0
  }

  const relativeX = clientX - rectLeft
  const clampedX = Math.max(0, Math.min(relativeX, rectWidth))
  const ratio = clampedX / rectWidth
  const index = Math.floor(ratio * barsCount)
  return Math.max(0, Math.min(barsCount - 1, index))
}

export function resolveSeekTimeFromBarIndex(barIndex: number, barsCount: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0 || barsCount <= 0) {
    return 0
  }

  const clampedIndex = Math.max(0, Math.min(barsCount - 1, Math.round(barIndex)))
  const ratio = clampedIndex / barsCount
  return ratio * duration
}

export function resolveProgressBarIndex(currentTime: number, duration: number, barsCount: number): number {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0 || barsCount <= 0) {
    return -1
  }

  const ratio = Math.max(0, Math.min(currentTime / duration, 1))
  const index = Math.floor(ratio * barsCount)
  return Math.max(0, Math.min(barsCount - 1, index))
}

export function buildWaveformBarsModel(heights: number[], activeProgressBarIndex: number, barsCount: number): WaveformBarModel[] {
  if (barsCount <= 0) {
    return []
  }

  return new Array(barsCount).fill(null).map((_, index) => {
    const rawHeight = heights[index] ?? 0.15
    const heightRatio = Math.max(0.06, Math.min(1.0, rawHeight))

    return {
      heightRatio,
      isPlayed: activeProgressBarIndex >= 0 && index <= activeProgressBarIndex,
    }
  })
}
