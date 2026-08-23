import { useId } from 'react'

export interface LineChartPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: LineChartPoint[]
  ariaLabel: string
  className?: string
  valueFormatter?: (value: number) => string
}

const WIDTH = 640
const HEIGHT = 220
const PADDING_X = 12
const PADDING_Y = 18
const GRID_LINES = 4

export function LineChart({ data, ariaLabel, className = '', valueFormatter = String }: LineChartProps) {
  const gradientId = useId()
  const safeData = data.length > 0 ? data : [{ label: '', value: 0 }]
  const maxValue = Math.max(...safeData.map((point) => point.value), 1)

  const stepX = safeData.length > 1
    ? (WIDTH - PADDING_X * 2) / (safeData.length - 1)
    : 0

  const points = safeData.map((point, index) => ({
    ...point,
    x: PADDING_X + index * stepX,
    y: HEIGHT - PADDING_Y - (point.value / maxValue) * (HEIGHT - PADDING_Y * 2),
  }))

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ')
  const areaPath = [
    `M ${points[0].x} ${HEIGHT - PADDING_Y}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${points[points.length - 1].x} ${HEIGHT - PADDING_Y}`,
    'Z',
  ].join(' ')

  const labelIndexes = new Set<number>()
  if (points.length > 1) {
    const ticks = Math.min(5, points.length)
    for (let tick = 0; tick < ticks; tick++) {
      labelIndexes.add(Math.round((tick * (points.length - 1)) / (ticks - 1)))
    }
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={ariaLabel}
      className={`w-full h-auto select-none ${className}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e11d48" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#e11d48" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {Array.from({ length: GRID_LINES + 1 }).map((_, index) => {
        const y = PADDING_Y + (index * (HEIGHT - PADDING_Y * 2)) / GRID_LINES
        return (
          <line
            key={index}
            x1={PADDING_X}
            x2={WIDTH - PADDING_X}
            y1={y}
            y2={y}
            stroke="#ffe4ec"
            strokeWidth="1"
          />
        )
      })}

      <path d={areaPath} fill={`url(#${gradientId})`} />

      <polyline
        points={linePoints}
        fill="none"
        stroke="#e11d48"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((point, index) => (
        <g key={`${point.label}-${index}`}>
          <circle cx={point.x} cy={point.y} r="8" fill="transparent">
            <title>{point.label ? `${point.label}: ${valueFormatter(point.value)}` : valueFormatter(point.value)}</title>
          </circle>
          <circle cx={point.x} cy={point.y} r="3" fill="#ffffff" stroke="#e11d48" strokeWidth="2" pointerEvents="none" />
        </g>
      ))}

      {[...labelIndexes].map((index) => {
        const point = points[index]
        if (!point?.label) return null
        return (
          <text
            key={index}
            x={point.x}
            y={HEIGHT - 2}
            textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
            fontSize="11"
            className="fill-rose-900/50 font-medium"
          >
            {point.label}
          </text>
        )
      })}
    </svg>
  )
}
