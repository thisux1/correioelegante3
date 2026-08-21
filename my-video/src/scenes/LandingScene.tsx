import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingElements } from "../components/FloatingElements";
import { SceneLabel } from "../components/SceneLabel";
import { COLORS } from "../constants";
import { fontFamily } from "../fonts";

export const LandingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mockupProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 60 },
  });

  const mockupScale = interpolate(mockupProgress, [0, 1], [0.85, 1]);
  const mockupOpacity = interpolate(mockupProgress, [0, 1], [0, 1]);

  // Simulated scroll
  const scrollY = interpolate(frame, [90, 350], [0, 280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out
  const fadeOut = interpolate(frame, [380, 420], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <GradientBackground>
      <FloatingElements count={8} />
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: fadeOut,
        }}
      >
        {/* Browser chrome mockup */}
        <div
          style={{
            width: 1400,
            height: 820,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
            opacity: mockupOpacity,
            transform: `scale(${mockupScale})`,
            border: `1px solid ${COLORS.glassBorder}`,
          }}
        >
          {/* Browser bar */}
          <div
            style={{
              height: 48,
              background: "#f8f8f8",
              borderBottom: "1px solid #e5e5e5",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: 8,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ff5f57" }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#febc2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#28c840" }} />
            <div
              style={{
                flex: 1,
                height: 28,
                background: "#fff",
                borderRadius: 8,
                marginLeft: 16,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                fontSize: 13,
                color: COLORS.textLight,
                fontFamily: fontFamily.sans,
              }}
            >
              correioelegante.studio
            </div>
          </div>

          {/* Page content */}
          <div
            style={{
              height: 772,
              background: `linear-gradient(135deg, ${COLORS.bg} 0%, #fff0f5 100%)`,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div style={{ transform: `translateY(-${scrollY}px)` }}>
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 24,
                    right: 24,
                    height: 64,
                    background: COLORS.glassSurface,
                    border: `1px solid ${COLORS.glassBorder}`,
                    borderRadius: 16,
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 24px",
                    zIndex: 10,
                  }}
                >
                  <div style={{ fontFamily: fontFamily.display, fontSize: 24, fontWeight: 700, color: COLORS.text }}>
                    Correio <span style={{ color: COLORS.primary }}>Elegante</span>
                  </div>
                  <div style={{ display: "flex", gap: 24, fontFamily: fontFamily.sans, fontSize: 16, color: COLORS.textLight, alignItems: "center" }}>
                    <span>Destinos</span>
                    <span>Preços</span>
                    <span>Galeria</span>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.primaryLight }} />
                  </div>
                </div>

              {/* Hero section */}
              <div
                style={{
                  height: 600,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "0 80px",
                }}
              >
                <h2
                  style={{
                    fontFamily: fontFamily.display,
                    fontSize: 64,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 20,
                    lineHeight: 1.2,
                  }}
                >
                  Mande um recado que faz sorrir
                </h2>
                <p
                  style={{
                    fontFamily: fontFamily.sans,
                    fontSize: 22,
                    color: COLORS.textLight,
                    marginBottom: 40,
                    maxWidth: 600,
                    lineHeight: 1.5,
                  }}
                >
                  Escreva uma carta especial, pague via Pix e entregue por QR Code.
                </p>

                {/* CTA Button */}
                <div
                  style={{
                    background: COLORS.primary,
                    color: "#fff",
                    padding: "16px 32px",
                    borderRadius: 12,
                    fontSize: 18,
                    fontWeight: 600,
                    fontFamily: fontFamily.sans,
                    boxShadow: `0 8px 24px ${COLORS.primary}40`,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Escrever minha carta →
                </div>
              </div>

              {/* Feature cards */}
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  padding: "0 80px",
                  justifyContent: "center",
                }}
              >
                {["✍️ Escreva", "💳 Pague", "📱 Compartilhe"].map((text, i) => {
                  const cardDelay = 120 + i * 15;
                  const cardOp = interpolate(frame, [cardDelay, cardDelay + 20], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  return (
                    <div
                      key={i}
                      style={{
                        width: 300,
                        padding: 40,
                        background: COLORS.glassSurface,
                        borderRadius: 20,
                        border: `1px solid ${COLORS.glassBorder}`,
                        textAlign: "center",
                        fontFamily: fontFamily.sans,
                        fontSize: 22,
                        fontWeight: 600,
                        color: COLORS.text,
                        opacity: cardOp,
                      }}
                    >
                      {text}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SceneLabel text="Landing Page" />
    </GradientBackground>
  );
};
