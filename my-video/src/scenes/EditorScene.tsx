import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { SceneLabel } from "../components/SceneLabel";
import { COLORS } from "../constants";
import { fontFamily } from "../fonts";

// Removed BLOCK_TYPES unused variable.

const THEMES = [
  { name: "Romantic Sunset", gradient: "linear-gradient(135deg, #d9466b, #f59bb5)" },
  { name: "Ocean Breeze", gradient: "linear-gradient(135deg, #0f766e, #14b8a6)" },
  { name: "Golden Letter", gradient: "linear-gradient(135deg, #8b5e34, #e6b86a)" },
  { name: "Forest Dream", gradient: "linear-gradient(135deg, #2f6f4f, #7bbf97)" },
  { name: "Midnight Ink", gradient: "linear-gradient(135deg, #1f3a8a, #60a5fa)" },
];

const EditorBlock: React.FC<{
  type: string;
  children: React.ReactNode;
  delay: number;
}> = ({ type, children, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const x = interpolate(progress, [0, 1], [40, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        padding: 20,
        marginBottom: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: COLORS.textLight,
          fontFamily: fontFamily.sans,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 8,
        }}
      >
        {type}
      </div>
      {children}
    </div>
  );
};

export const EditorScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Text typing animation
  const typingText = "Para alguém muito especial...";
  const charsShown = Math.min(
    typingText.length,
    Math.floor(interpolate(frame, [60, 180], [0, typingText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }))
  );

  // Theme change
  const activeThemeIndex = frame < 450 ? 0 : frame < 520 ? 1 : 0;

  // Autosave indicator
  const autosaveOpacity = interpolate(
    frame,
    [380, 390, 440, 450],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Fade out
  const fadeOut = interpolate(frame, [620, 660], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Toolbar fade in
  const toolbarProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  return (
    <GradientBackground>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 60,
          gap: 24,
          opacity: fadeOut,
        }}
      >
        {/* Sidebar options / Layout */}
        <div
          style={{
            width: 240,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            opacity: interpolate(toolbarProgress, [0, 1], [0, 1]),
          }}
        >
          {/* Header Editor Modular */}
          <div>
            <h3 style={{ fontFamily: fontFamily.display, fontSize: 24, fontWeight: 700, color: COLORS.text }}>
              Editor Modular
            </h3>
            <p style={{ fontFamily: fontFamily.sans, fontSize: 14, color: COLORS.textLight }}>
              Crie sua carta
            </p>
          </div>

          {/* Action Toolbar */}
          <div
            style={{
              background: COLORS.glassSurface,
              borderRadius: 16,
              border: `1px solid ${COLORS.glassBorder}`,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)"
            }}
          >
            {["Adicionar bloco (+)", "Tema", "Preview", "Salvar"].map((action, i) => {
              const btnProgress = spring({
                frame: frame - (10 + i * 5),
                fps,
                config: { damping: 15, stiffness: 120 },
              });
              return (
                <div
                  key={i}
                  style={{
                    background: i === 0 ? COLORS.primary : "#f9fafb",
                    color: i === 0 ? "#fff" : COLORS.text,
                    border: i === 0 ? "none" : "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "10px",
                    fontFamily: fontFamily.sans,
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: "center",
                    opacity: interpolate(btnProgress, [0, 1], [0, 1]),
                    transform: `scale(${interpolate(btnProgress, [0, 1], [0.9, 1])})`,
                  }}
                >
                  {action}
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor canvas */}
        <div
          style={{
            flex: 1,
            background: COLORS.glassSurface,
            borderRadius: 20,
            border: `1px solid ${COLORS.glassBorder}`,
            padding: 32,
            backdropFilter: "blur(20px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Autosave indicator */}
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 13,
              fontFamily: fontFamily.sans,
            }}
          >
            <div style={{ color: COLORS.textLight }}>
              Blocos: <span style={{ fontWeight: 600 }}>3/30</span>
            </div>
            <div
              style={{
                opacity: autosaveOpacity,
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#10b981",
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: 3, background: "#10b981" }} />
              Saved
            </div>
          </div>

          {/* Text block */}
          <EditorBlock type="Text" delay={30}>
            <p
              style={{
                fontFamily: fontFamily.cursive,
                fontSize: 28,
                color: COLORS.text,
                lineHeight: 1.5,
                minHeight: 40,
              }}
            >
              {typingText.slice(0, charsShown)}
              {charsShown < typingText.length && (
                <span
                  style={{
                    borderRight: `2px solid ${COLORS.primary}`,
                    marginLeft: 1,
                    animation: "none",
                    opacity: frame % 30 < 15 ? 1 : 0,
                  }}
                />
              )}
            </p>
          </EditorBlock>

          {/* Image block */}
          <EditorBlock type="Image" delay={200}>
            <div
              style={{
                width: "100%",
                height: 200,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${COLORS.primaryLight}40, ${COLORS.accent}40)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
              }}
            >
              📸
            </div>
          </EditorBlock>

          {/* Music block */}
          <EditorBlock type="Music" delay={300}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "8px 0",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 20,
                }}
              >
                ▶
              </div>
              <div style={{ flex: 1 }}>
                {/* Waveform bars */}
                <div style={{ display: "flex", gap: 2, alignItems: "end", height: 32 }}>
                  {Array.from({ length: 40 }, (_, i) => {
                    const barHeight = 8 + Math.sin((i * 0.5) + frame * 0.08) * 12 + Math.cos((i * 0.3) + frame * 0.05) * 8;
                    return (
                      <div
                        key={i}
                        style={{
                          width: 3,
                          height: Math.max(4, barHeight),
                          borderRadius: 2,
                          background: `linear-gradient(to top, ${COLORS.primary}, ${COLORS.primaryLight})`,
                          opacity: 0.7,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </EditorBlock>
        </div>

        {/* Theme selector */}
        <div
          style={{
            width: 200,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontFamily: fontFamily.sans,
              fontWeight: 600,
              color: COLORS.textLight,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 4,
              opacity: interpolate(toolbarProgress, [0, 1], [0, 1]),
            }}
          >
            Themes
          </div>
          {THEMES.map((theme, i) => {
            const isActive =
              (activeThemeIndex === 0 && i === 0) ||
              (activeThemeIndex === 1 && i === 1);
            const themeProgress = spring({
              frame: frame - (15 + i * 8),
              fps,
              config: { damping: 15, stiffness: 100 },
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: isActive ? COLORS.glassSurface : "transparent",
                  borderRadius: 12,
                  border: isActive ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                  opacity: interpolate(themeProgress, [0, 1], [0, 1]),
                  transform: `translateX(${interpolate(themeProgress, [0, 1], [20, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: theme.gradient,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: fontFamily.sans,
                    fontSize: 13,
                    color: COLORS.text,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {theme.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <SceneLabel text="Block Editor" />
    </GradientBackground>
  );
};
