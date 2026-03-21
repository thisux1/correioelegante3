# 01 - Player e Visualizer

## Objetivo

Evoluir o MusicBlock para uma experiencia premium (glassmorphism, minimalista) com visualizer funcional e fallback robusto, sem regressao de playback.

## Escopo

- Refatorar `MusicBlock` separando responsabilidades:
  - `MusicPlayerCore` (playback e controles)
  - `AudioVisualizer` (analise de audio)
  - `MusicPlayerShell` (layout/estilo)
- Visualizer funcional com Web Audio API (`AnalyserNode`).
- Fallback automatico quando CORS/capture falhar (visualizer temporal/waveform fake).
- Preservar acessibilidade:
  - `aria-label` em controles
  - foco visivel
  - `prefers-reduced-motion`

## Regras tecnicas

- Visualizer nunca pode bloquear `audio.play()`.
- Cleanup obrigatorio de `AudioContext`, RAF e listeners no unmount.
- Sem libs pesadas extras para visualizer.

## Critérios de aceite

- Audio toca com confiabilidade.
- Visualizer funciona quando analyzer esta disponivel.
- Fallback visual aparece quando analyzer nao pode ser usado.
- Lint/test/build frontend verdes.
