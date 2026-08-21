import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../constants";

interface FloatingElementsProps {
  count?: number;
  variant?: "hearts" | "envelopes";
}

const HeartSvg: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={COLORS.primary} opacity={opacity}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const EnvelopeSvg: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth={1.5} opacity={opacity}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 4L12 13 2 4" />
  </svg>
);

// Deterministic pseudo-random based on seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export const FloatingElements: React.FC<FloatingElementsProps> = ({
  count = 8,
  variant = "hearts",
}) => {
  const frame = useCurrentFrame();

  const elements = Array.from({ length: count }, (_, i) => {
    const x = seededRandom(i * 7 + 1) * 100;
    const baseY = seededRandom(i * 13 + 3) * 100;
    const size = 16 + seededRandom(i * 19 + 5) * 24;
    const speed = 0.15 + seededRandom(i * 23 + 7) * 0.3;
    const opacity = 0.06 + seededRandom(i * 29 + 11) * 0.12;
    const rotation = seededRandom(i * 31 + 13) * 360;

    const y = (baseY + frame * speed * 0.3) % 120 - 10;
    const rotAmount = rotation + frame * (speed * 0.5);

    const fadeIn = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: `rotate(${rotAmount}deg)`,
          opacity: opacity * fadeIn,
        }}
      >
        {variant === "hearts" ? (
          <HeartSvg size={size} opacity={1} />
        ) : (
          <EnvelopeSvg size={size} opacity={1} />
        )}
      </div>
    );
  });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {elements}
    </div>
  );
};
