import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { HeartPulse } from "../components/HeartPulse";
import { FloatingElements } from "../components/FloatingElements";
import { SceneLabel } from "../components/SceneLabel";
import { COLORS } from "../constants";
import { fontFamily } from "../fonts";

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nameProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const roleProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const linksProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Gentle pulse on the whole card
  const pulse = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.98, 1.02]
  );

  return (
    <GradientBackground>
      <FloatingElements count={12} />

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${pulse})`,
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <HeartPulse size={64} />
        </div>

        <h1
          style={{
            fontFamily: fontFamily.display,
            fontSize: 88,
            fontWeight: 700,
            color: COLORS.text,
            opacity: interpolate(nameProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(nameProgress, [0, 1], [30, 0])}px)`,
            letterSpacing: -1,
          }}
        >
          Thiago
        </h1>

        <p
          style={{
            fontFamily: fontFamily.sans,
            fontSize: 28,
            fontWeight: 300,
            color: COLORS.textLight,
            opacity: interpolate(roleProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(roleProgress, [0, 1], [20, 0])}px)`,
            marginTop: 8,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Fullstack Developer
        </p>

        {/* Links */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 48,
            opacity: interpolate(linksProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(linksProgress, [0, 1], [20, 0])}px)`,
          }}
        >
          <div
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              background: `${COLORS.primary}12`,
              border: `1px solid ${COLORS.primary}25`,
              fontFamily: fontFamily.sans,
              fontSize: 18,
              color: COLORS.primary,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>⌨</span> github.com/thiago
          </div>
          <div
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              background: `${COLORS.primary}12`,
              border: `1px solid ${COLORS.primary}25`,
              fontFamily: fontFamily.sans,
              fontSize: 18,
              color: COLORS.primary,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>🔗</span> correioelegante.studio
          </div>
        </div>
      </div>

      <SceneLabel text="Thiago — Fullstack Developer" position="bottom-center" />
    </GradientBackground>
  );
};
