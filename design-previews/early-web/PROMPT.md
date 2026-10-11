# PROMPT — early-web

Brief despachado ao subagent (reconstruído):

---

Você vai criar prévias estáticas de design para o Correio Elegante — plataforma BR de páginas românticas interativas. Entregáveis em `design-previews/early-web/`:

1. `lp.html` — landing page do produto no estilo
2. `card.html` — uma carta/página gerada "pronta" (o que o destinatário veria)
3. `README.md` — paleta (hex), fontes, tokens extraíveis

## Estilo: Early Web / GeoCities (1998–2005)

Fan page pessoal de internet primitiva: marquee CSS, contador de visitantes, guestbook, "under construction", webring, janelas Win95-inspired (recoloridas na paleta da marca), dividers ornamentais, humor de "página feita com carinho por um fã". Energia de meme/arquivo de internet.

## Momento casado: anônimo (admirador secreto)

A `card.html` é a página de um admirador anônimo: mistério de quem fez, cartas de pista (clue cards), contador travado em `0000001` (você é a única visitante), guestbook onde só ela escreve.

## Restrições (marca)

- Light theme estrito — estrelato/papel claro, chrome Win95 recolorido rosa/vinho; nada escuro
- ZERO emojis — corações/dingbats são GIF-era pixel art em SVG/data-URI
- ZERO pills/badges de marketing moderno (badges "era-authentic" tipo contador/webring valem como ornamento)
- Copy pt-BR — voz de fan page apaixonada + mistério; nunca marketês
- Self-contained: HTML único, CSS/JS inline, só Google Fonts de CDN
- Fontes pixel: VT323/Silkscreen (latin-ext verificado); fonte legível para corpo
- Mobile-first sem overflow; `prefers-reduced-motion` respeitado
- Interações: guestbook funcional client-side, clue cards clicáveis, marquee

## Verificação obrigatória

Renderizar headless em desktop + mobile (390px), revisar screenshots, iterar até perfeito; zero erros de console.
