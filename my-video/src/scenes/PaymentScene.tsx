import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GlassCard } from "../components/GlassCard";
import { GradientBackground } from "../components/GradientBackground";
import { SceneLabel } from "../components/SceneLabel";
import { COLORS } from "../constants";
import { fontFamily } from "../fonts";

export const PaymentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  const paymentProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  const checkmarkProgress = spring({
    frame: frame - 240,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // Card tilt
  const tiltX = interpolate(frame, [0, 420], [0, 8], { extrapolateRight: "clamp" });
  const tiltY = interpolate(Math.sin(frame * 0.03), [-1, 1], [-5, 5]);

  // Fade out
  const fadeOut = interpolate(frame, [380, 420], [1, 0], {
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
          alignItems: "center",
          justifyContent: "center",
          gap: 64,
          padding: 80,
          opacity: fadeOut,
        }}
      >
        {/* Public card preview */}
        <div
          style={{
            opacity: interpolate(cardProgress, [0, 1], [0, 1]),
            transform: `perspective(1000px) rotateY(${tiltY}deg) rotateX(${tiltX}deg) scale(${interpolate(cardProgress, [0, 1], [0.8, 1])})`,
          }}
        >
          <GlassCard
            borderRadius={28}
            style={{
              width: 480,
              padding: "48px 40px",
              background: "linear-gradient(160deg, rgba(255,255,255,0.7), rgba(255,240,245,0.5))",
              boxShadow: `0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px ${COLORS.glassBorder}`,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💌</div>
              <h3
                style={{
                  fontFamily: fontFamily.display,
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.text,
                  marginBottom: 12,
                }}
              >
                Para alguém especial
              </h3>
              <p
                style={{
                  fontFamily: fontFamily.cursive,
                  fontSize: 20,
                  color: COLORS.textLight,
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                "Você faz meus dias mais bonitos..."
              </p>

              {/* Mock music player */}
              <div
                style={{
                  background: "rgba(0,0,0,0.04)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 14,
                  }}
                >
                  ▶
                </div>
                <div style={{ flex: 1, height: 4, background: "#e5e7eb", borderRadius: 2 }}>
                  <div
                    style={{
                      width: "40%",
                      height: "100%",
                      background: COLORS.primary,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>

              {/* Image placeholder */}
              <div
                style={{
                  height: 120,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${COLORS.primaryLight}30, ${COLORS.accent}30)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                }}
              >
                🌸
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Payment side */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            opacity: interpolate(paymentProgress, [0, 1], [0, 1]),
            transform: `translateX(${interpolate(paymentProgress, [0, 1], [40, 0])}px)`,
          }}
        >
          {/* Pix QR Code */}
          <GlassCard borderRadius={20} style={{ padding: 32, width: 360 }}>
            <div
              style={{
                fontSize: 16,
                fontFamily: fontFamily.sans,
                fontWeight: 600,
                color: COLORS.text,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 20 }}>◉</span> Pix
            </div>
            {/* QR code mock */}
            <div
              style={{
                width: 180,
                height: 180,
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "repeat(9, 1fr)",
                gridTemplateRows: "repeat(9, 1fr)",
                gap: 2,
              }}
            >
              {Array.from({ length: 81 }, (_, i) => {
                const row = Math.floor(i / 9);
                const col = i % 9;
                const isBorder = row < 3 && col < 3 || row < 3 && col > 5 || row > 5 && col < 3;
                const isDark = isBorder || (i * 7 + 3) % 3 !== 0;
                return (
                  <div
                    key={i}
                    style={{
                      background: isDark ? COLORS.text : "#f3f4f6",
                      borderRadius: 2,
                    }}
                  />
                );
              })}
            </div>
          </GlassCard>

          {/* Success checkmark */}
          <div
            style={{
              opacity: interpolate(checkmarkProgress, [0, 1], [0, 1]),
              transform: `scale(${interpolate(checkmarkProgress, [0, 1], [0.5, 1])})`,
              textAlign: "center",
            }}
          >
            <GlassCard borderRadius={16} style={{ padding: "16px 24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  fontFamily: fontFamily.sans,
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#10b981",
                }}
              >
                <span style={{ fontSize: 24 }}>✓</span> Payment confirmed
              </div>
            </GlassCard>
          </div>

          {/* Share link */}
          <div
            style={{
              opacity: interpolate(frame, [280, 310], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <GlassCard borderRadius={16} style={{ padding: "16px 24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: fontFamily.mono,
                  fontSize: 14,
                  color: COLORS.primary,
                }}
              >
                🔗 correioelegante.studio/card/abc123
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <SceneLabel text="Payment & Share" />
    </GradientBackground>
  );
};
