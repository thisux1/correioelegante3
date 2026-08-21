import type React from "react";
import { COLORS } from "../constants";

interface GlassCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  borderRadius?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  borderRadius = 16,
}) => {
  return (
    <div
      style={{
        background: COLORS.glassSurface,
        border: `1px solid ${COLORS.glassBorder}`,
        borderRadius,
        padding: 40,
        backdropFilter: "blur(20px)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
