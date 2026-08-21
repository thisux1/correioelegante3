import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../constants";
import { fontFamily } from "../fonts";

interface SceneLabelProps {
  text: string;
  position?: "top-left" | "bottom-left" | "bottom-center";
  dark?: boolean;
}

export const SceneLabel: React.FC<SceneLabelProps> = ({
  text,
  position = "top-left",
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, 15], [10, 0], {
    extrapolateRight: "clamp",
  });

  const positionStyle: React.CSSProperties =
    position === "top-left"
      ? { top: 48, left: 48 }
      : position === "bottom-left"
        ? { bottom: 48, left: 48 }
        : { bottom: 48, left: "50%", transform: `translateX(-50%) translateY(${translateY}px)` };

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyle,
        opacity,
        transform: position !== "bottom-center" ? `translateY(${translateY}px)` : positionStyle.transform,
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: dark
            ? "rgba(255,255,255,0.12)"
            : `${COLORS.primary}18`,
          border: `1px solid ${dark ? "rgba(255,255,255,0.2)" : COLORS.primary + "30"}`,
          borderRadius: 100,
          padding: "8px 20px",
          fontSize: 16,
          fontFamily: fontFamily.sans,
          fontWeight: 500,
          color: dark ? "rgba(255,255,255,0.8)" : COLORS.primary,
          letterSpacing: 0.5,
          backdropFilter: "blur(10px)",
        }}
      >
        {text}
      </div>
    </div>
  );
};
