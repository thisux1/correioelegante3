export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL_DURATION = 90 * FPS; // 2700 frames = 90s

// Scene durations in frames
export const SCENES = {
  title:   { from: 0,    duration: 6 * FPS },   // 0:00–0:06
  idea:    { from: 6 * FPS, duration: 10 * FPS },  // 0:06–0:16
  landing: { from: 16 * FPS, duration: 14 * FPS }, // 0:16–0:30
  editor:  { from: 30 * FPS, duration: 22 * FPS }, // 0:30–0:52
  payment: { from: 52 * FPS, duration: 14 * FPS }, // 0:52–1:06
  stack:   { from: 66 * FPS, duration: 12 * FPS }, // 1:06–1:18
  closing: { from: 78 * FPS, duration: 12 * FPS }, // 1:18–1:30
} as const;

// Design tokens from the frontend
export const COLORS = {
  primary: '#e11d48',
  primaryLight: '#fb7185',
  secondary: '#f43f5e',
  accent: '#fda4af',
  bg: '#fdf2f8',
  surface: '#fff9fb',
  glassSurface: 'rgba(255,255,255,0.6)',
  glassBorder: 'rgba(255,255,255,0.4)',
  text: '#1f2937',
  textLight: '#6b7280',
  darkBg: '#0f172a',
  darkSurface: '#1e293b',
  white: '#ffffff',
  gold: '#d4a574',
} as const;
