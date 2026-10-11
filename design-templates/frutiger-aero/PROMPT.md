# PROMPT — frutiger-aero

Brief despachado ao subagent (reconstruído):

---

Você vai criar prévias estáticas de design para o Correio Elegante — plataforma BR de páginas românticas interativas. Entregáveis em `design-previews/frutiger-aero/`:

1. `lp.html` — landing page do produto no estilo
2. `card.html` — uma carta/página gerada "pronta" (o que o destinatário veria)
3. `README.md` — paleta (hex), fontes, tokens extraíveis

## Estilo: Frutiger Aero (2004–2013)

Nature-tech glossy: aurora suave no céu creme/blush, painéis de vidro com blur + specular, bolhas procedurais, peixes/gotas/folhas, taskbar Aero translúcida. Otimismo de tech-utopia dos anos 2000 — a estética "aesthetic" do TikTok de design.

## Momento casado: data especial (aniversário de namoro)

A `card.html` é celebratória: contador de dias juntos (365), carta carinhosa, polaroids CSS/SVG, clima de celebração glossy.

## Restrições (marca)

- Light theme estrito — creme, blush, azul-água claro; glossy mas nunca escuro
- ZERO emojis — bolhas/corações/folhas são SVG procedural
- ZERO pills/badges — hierarquia tipográfica
- Copy pt-BR natural — doce, sincera, sem marketês
- Self-contained: HTML único, CSS/JS inline, só Google Fonts de CDN; zero imagens externas (bolhas/aurora via CSS/SVG)
- Fontes pixel como acento (VT323/Silkscreen em chrome/headlines, latin-ext verificado); fonte legível para corpo
- Mobile-first sem overflow; `prefers-reduced-motion` respeitado
- Interações: preview card flutuante, contador animado, vidro com reflexo

## Verificação obrigatória

Renderizar headless em desktop + mobile, revisar screenshots, iterar até perfeito; zero erros de console; confirmar light theme por amostragem de pixels.
