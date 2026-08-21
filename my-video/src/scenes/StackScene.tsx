import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { TechBadge } from "../components/TechBadge";
import { SceneLabel } from "../components/SceneLabel";
import { fontFamily } from "../fonts";

const TECH_STACK = {
  frontend: [
    { label: "React 19", color: "#61dafb", icon: "⚛️" },
    { label: "TypeScript", color: "#3178c6", icon: "📘" },
    { label: "Vite", color: "#bd34fe", icon: "⚡" },
    { label: "Tailwind CSS v4", color: "#06b6d4", icon: "🎨" },
    { label: "Framer Motion", color: "#e84393", icon: "✨" },
    { label: "Zustand", color: "#f59e0b", icon: "🐻" },
  ],
  backend: [
    { label: "Express 5", color: "#22c55e", icon: "🚀" },
    { label: "Prisma", color: "#2d3748", icon: "💎" },
    { label: "MongoDB Atlas", color: "#00ed64", icon: "🍃" },
    { label: "JWT Auth", color: "#d946ef", icon: "🔐" },
  ],
  integrations: [
    { label: "Stripe", color: "#635bff", icon: "💳" },
    { label: "Mercado Pago", color: "#009ee3", icon: "💰" },
    { label: "Cloudinary", color: "#f5a623", icon: "☁️" },
    { label: "Vercel", color: "#fff", icon: "▲" },
  ],
};

const CODE_SNIPPET = `// route → controller → service
app.post('/api/messages', auth, validate(schema), 
  async (req, res) => {
    const result = await messageService.create({
      userId: req.user.id,
      blocks: req.body.blocks,
      theme: req.body.theme,
    });
    res.status(201).json(result);
  }
);`;

export const StackScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade out
  const fadeOut = interpolate(frame, [320, 360], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Code scroll
  const codeY = interpolate(frame, [0, 360], [0, -60], {
    extrapolateRight: "clamp",
  });

  const codeOpacity = interpolate(frame, [20, 50], [0, 0.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <GradientBackground variant="dark">
      {/* Background code */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 80,
          width: 500,
          opacity: codeOpacity,
          transform: `translateY(${codeY}px)`,
        }}
      >
        <pre
          style={{
            fontFamily: fontFamily.mono,
            fontSize: 16,
            lineHeight: 1.8,
            color: "#e2e8f0",
            whiteSpace: "pre-wrap",
          }}
        >
          {CODE_SNIPPET}
        </pre>
      </div>

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 100px",
          opacity: fadeOut,
        }}
      >
        {/* Section: Frontend */}
        <div style={{ marginBottom: 36 }}>
          <h3
            style={{
              fontFamily: fontFamily.sans,
              fontSize: 16,
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 16,
            }}
          >
            Frontend
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {TECH_STACK.frontend.map((tech, i) => (
              <TechBadge key={tech.label} {...tech} delay={10 + i * 6} />
            ))}
          </div>
        </div>

        {/* Section: Backend */}
        <div style={{ marginBottom: 36 }}>
          <h3
            style={{
              fontFamily: fontFamily.sans,
              fontSize: 16,
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 16,
            }}
          >
            Backend
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {TECH_STACK.backend.map((tech, i) => (
              <TechBadge key={tech.label} {...tech} delay={60 + i * 6} />
            ))}
          </div>
        </div>

        {/* Section: Integrations */}
        <div>
          <h3
            style={{
              fontFamily: fontFamily.sans,
              fontSize: 16,
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 16,
            }}
          >
            Integrations & Infra
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {TECH_STACK.integrations.map((tech, i) => (
              <TechBadge key={tech.label} {...tech} delay={110 + i * 6} />
            ))}
          </div>
        </div>
      </div>

      <SceneLabel text="Architecture" dark />
    </GradientBackground>
  );
};
