import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GlassCard } from "../components/GlassCard";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingElements } from "../components/FloatingElements";
import { SceneLabel } from "../components/SceneLabel";
import { COLORS } from "../constants";
import { fontFamily } from "../fonts";

export const IdeaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = "Give people a beautiful, frictionless way to send heartfelt messages to someone special — and make it feel like a gift.".split(" ");

  const cardProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const cardScale = interpolate(cardProgress, [0, 1], [0.9, 1]);
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);

  // Fade out
  const fadeOut = interpolate(frame, [270, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <GradientBackground>
      <FloatingElements count={10} variant="envelopes" />

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 120,
          opacity: fadeOut,
        }}
      >
        <div
          style={{
            transform: `scale(${cardScale})`,
            opacity: cardOpacity,
            maxWidth: 900,
          }}
        >
          <GlassCard borderRadius={32} style={{ padding: "60px 72px" }}>
            <p
              style={{
                fontFamily: fontFamily.display,
                fontSize: 38,
                lineHeight: 1.6,
                color: COLORS.text,
                textAlign: "center",
              }}
            >
              {words.map((word, i) => {
                const wordDelay = 15 + i * 3;
                const wordOpacity = interpolate(
                  frame,
                  [wordDelay, wordDelay + 8],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                return (
                  <span key={i} style={{ opacity: wordOpacity }}>
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          </GlassCard>
        </div>
      </div>

      <SceneLabel text="The Idea" />
    </GradientBackground>
  );
};
