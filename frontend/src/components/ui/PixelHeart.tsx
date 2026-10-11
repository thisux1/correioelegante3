interface PixelHeartProps {
  className?: string
  color?: string
}

export function PixelHeart({ className = '', color = '#e11d48' }: PixelHeartProps) {
  const rows = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000']
  return (
    <svg viewBox="0 0 7 6" className={className} aria-hidden="true" shapeRendering="crispEdges">
      {rows.map((row, y) =>
        row.split('').map((cell, x) =>
          cell === '1' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} />
          ) : null,
        ),
      )}
    </svg>
  )
}
