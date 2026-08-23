export interface BarChartPoint {
  label: string
  value: number
}

interface BarChartProps {
  data: BarChartPoint[]
  orientation?: 'vertical' | 'horizontal'
  ariaLabel: string
  className?: string
  valueFormatter?: (value: number) => string
  maxLabelLength?: number
}

const VERTICAL_WIDTH = 640
const VERTICAL_HEIGHT = 220
const PADDING_X = 12
const PADDING_Y = 18
const GRID_LINE_COUNT = 4
const HORIZONTAL_ROW_HEIGHT = 44
const HORIZONTAL_LABEL_WIDTH = 150

function truncateLabel(label: string, maxLength: number): string {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label
}

export function BarChart({
  data,
  orientation = 'vertical',
  ariaLabel,
  className = '',
  valueFormatter = String,
  maxLabelLength = 14,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((point) => point.value), 1)

  if (orientation === 'horizontal') {
    const height = Math.max(data.length * HORIZONTAL_ROW_HEIGHT + PADDING_Y * 2, 80)
    const barAreaWidth = 640 - HORIZONTAL_LABEL_WIDTH - PADDING_X * 2

    return (
      <svg
        viewBox={`0 0 640 ${height}`}
        role="img"
        aria-label={ariaLabel}
        className={`w-full h-auto select-none ${className}`}
      >
        {data.map((point, index) => {
          const rowY = PADDING_Y + index * HORIZONTAL_ROW_HEIGHT
          const barWidth = Math.max((point.value / maxValue) * barAreaWidth, point.value > 0 ? 4 : 0)
          return (
            <g key={`${point.label}-${index}`}>
              <text
                x={HORIZONTAL_LABEL_WIDTH - 10}
                y={rowY + HORIZONTAL_ROW_HEIGHT / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="13"
                className="fill-rose-900/70 font-medium"
              >
                {truncateLabel(point.label, maxLabelLength + 4)}
              </text>
              <rect
                x={HORIZONTAL_LABEL_WIDTH}
                y={rowY + 8}
                width={barWidth}
                height={HORIZONTAL_ROW_HEIGHT - 20}
                rx="6"
                fill="#e11d48"
                opacity="0.85"
              >
                <title>{`${truncateLabel(point.label, maxLabelLength)}: ${valueFormatter(point.value)}`}</title>
              </rect>
              <text
                x={HORIZONTAL_LABEL_WIDTH + barWidth + 8}
                y={rowY + HORIZONTAL_ROW_HEIGHT / 2}
                dominantBaseline="middle"
                fontSize="12"
                className="fill-rose-900/60 font-semibold"
              >
                {valueFormatter(point.value)}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const stepX = (VERTICAL_WIDTH - PADDING_X * 2) / Math.max(data.length, 1)
  const barWidth = Math.min(stepX * 0.55, 42)

  return (
    <svg
      viewBox={`0 0 ${VERTICAL_WIDTH} ${VERTICAL_HEIGHT}`}
      role="img"
      aria-label={ariaLabel}
      className={`w-full h-auto select-none ${className}`}
    >
      {Array.from({ length: GRID_LINE_COUNT + 1 }).map((_, index) => {
        const y = PADDING_Y + (index * (VERTICAL_HEIGHT - PADDING_Y * 2)) / GRID_LINE_COUNT
        return (
          <line
            key={index}
            x1={PADDING_X}
            x2={VERTICAL_WIDTH - PADDING_X}
            y1={y}
            y2={y}
            stroke="#ffe4ec"
            strokeWidth="1"
          />
        )
      })}

      {data.map((point, index) => {
        const barHeight = (point.value / maxValue) * (VERTICAL_HEIGHT - PADDING_Y * 2)
        const x = PADDING_X + index * stepX + (stepX - barWidth) / 2
        const y = VERTICAL_HEIGHT - PADDING_Y - barHeight
        const centerX = x + barWidth / 2
        return (
          <g key={`${point.label}-${index}`}>
            <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 2)} rx="6" fill="#e11d48" opacity="0.9">
              <title>{`${point.label}: ${valueFormatter(point.value)}`}</title>
            </rect>
            {data.length <= 16 && (
              <text
                x={centerX}
                y={VERTICAL_HEIGHT - 4}
                textAnchor="middle"
                fontSize="11"
                className="fill-rose-900/50 font-medium"
              >
                {truncateLabel(point.label, maxLabelLength)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
