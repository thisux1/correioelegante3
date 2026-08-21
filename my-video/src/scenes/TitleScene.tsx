import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { HeartPulse } from "../components/HeartPulse";
import { SceneLabel } from "../components/SceneLabel";
import { COLORS } from "../constants";
import { fontFamily } from "../fonts";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const subtitleProgress = spring({
    frame: frame - 35,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);
  const subtitleY = interpolate(subtitleProgress, [0, 1], [30, 0]);

  // Fade out at end
  const fadeOut = interpolate(frame, [150, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <GradientBackground>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: fadeOut,
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <HeartPulse size={72} />
        </div>

        <h1
          style={{
            fontFamily: fontFamily.display,
            fontSize: 96,
            fontWeight: 700,
            color: COLORS.text,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: -1,
          }}
        >
          Correio Elegante
        </h1>

        <p
          style={{
            fontFamily: fontFamily.cursive,
            fontSize: 36,
            color: COLORS.primary,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            marginTop: 16,
          }}
        >
          Digital Love Letters
        </p>
      </div>

      <SceneLabel text="Correio Elegante" position="bottom-left" />
    </GradientBackground>
  );
};
