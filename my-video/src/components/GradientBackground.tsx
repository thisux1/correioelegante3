import type React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../constants";

interface GradientBackgroundProps {
  variant?: "pink" | "dark";
  children?: React.ReactNode;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  variant = "pink",
  children,
}) => {
  const gradient =
    variant === "pink"
      ? `radial-gradient(ellipse at 30% 20%, ${COLORS.primaryLight}44 0%, transparent 60%),
         radial-gradient(ellipse at 70% 80%, ${COLORS.accent}33 0%, transparent 60%),
         linear-gradient(135deg, ${COLORS.bg} 0%, #fff0f5 50%, ${COLORS.bg} 100%)`
      : `radial-gradient(ellipse at 30% 20%, #1e3a5f44 0%, transparent 60%),
         linear-gradient(135deg, ${COLORS.darkBg} 0%, ${COLORS.darkSurface} 100%)`;

  return (
    <AbsoluteFill
      style={{
        background: gradient,
        overflow: "hidden",
      }}
    >
      {/* Subtle noise overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          // eslint-disable-next-line @remotion/no-background-image
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
