# Frutiger Aero — Correio Elegante (preview)

Otimismo de vidro 2007–2013 re-paletado para romance: manhã de orvalho, rosa e creme em vez de azul corporativo. Bolhas e gotas são CSS puro (gradientes + transform), sem imagens externas.

## Arquivos

- `lp.html` — landing page: aurora de luz da manhã, sol com lens flare, painéis de vidro, CTAs glossy, faixa de "meadow mist" no rodapé. Linka para `card.html`.
- `card.html` — página gerada (Gui → Lari, 1 ano): carta em painel de vidro, contador "365 dias" em fonte pixel, 3 polaroids com cenas SVG, bolhas com corações, taskbar com relógio.

## Paleta

| Uso | Hex |
|---|---|
| Céu / creme | `#fffaf5` → `#fff3ef` → `#ffeef4` → `#ffe4ec` → `#f6cfe0` |
| Blush | `#ffe4ec`, `#fecdd3`, `#fda4af` |
| Rosa ação | `#f43f5e`, `#e11d48`, `#be123c` |
| Texto (vinho) | `#4c0519`, `#701a35`, `#881337` |
| Sol / flare | `#ffd98e`, `#fff0c8` |
| Orvalho (prado) | `#d7f5e3`, `#a9e8c6` |

## Fontes (Google Fonts)

- **Nunito** (400–900) — corpo, botões; sans arredondada "Frutiger-adjacent".
- **Varela Round** — display/títulos.
- **Silkscreen** — acentos pixel (eyebrows, contador, taskbar).
- **Caveat** — assinatura e legendas de polaroid (só em `card.html`).

## Tokens extraíveis

```css
--glass-bg:  linear-gradient(150deg, rgba(255,255,255,.74), rgba(255,255,255,.36) 58%, rgba(255,255,255,.52));
--glass:     backdrop-filter: blur(16px) saturate(1.5); border: 1px solid rgba(255,255,255,.85);
             inset 0 1.5px 0 rgba(255,255,255,.95) + 0 26px 60px -22px rgba(136,19,55,.28);
--specular:  ::before top-sweep — linear-gradient(180deg, rgba(255,255,255,.5), transparent 85%), height 42%;
--btn-gloss: ::before cap — left/right 5%, top 5%, height 46%, gradient branco .9→.18 sobre rose;
             corpo linear-gradient(180deg,#fb7288,#e11d48 52%,#be123c);
--radius-panel: 28px;  --radius-btn: 999px;
```

Bolha (`.bubble`): radial specular em 30%/24% + micro-highlight em 66%/76% + conic iridescente fraco + `inset 0 0 0 1px white` de aro. Gota (`.droplet`): border-radius orgânico `52% 48% 55% 45% / 58% 56% 44% 42%`, sombra de contato `0 3px 5px rgba(76,5,25,.16)`.

## Performance

`backdrop-filter` só nos painéis (~6/página). Bolhas/gotas são gradientes animados via `transform`/`opacity` apenas; auroras e nuvens são gradientes radiais grandes sem `filter`. `prefers-reduced-motion` desliga tudo.
