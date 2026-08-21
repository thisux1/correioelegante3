import type React from "react";
import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";

interface TechBadgeProps {
  label: string;
  color: string;
  delay?: number;
  icon?: string;
}

export const TechBadge: React.FC<TechBadgeProps> = ({
  label,
  color,
  delay = 0,
  icon,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 120, mass: 0.8 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.6, 1]);
  const y = interpolate(progress, [0, 1], [20, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${y}px)`,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: `${color}15`,
        border: `1px solid ${color}40`,
        borderRadius: 12,
        padding: "10px 18px",
        fontFamily: fontFamily.sans,
        fontSize: 18,
        fontWeight: 600,
        color,
      }}
    >
      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      {label}
    </div>
  );
};
