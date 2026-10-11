# retro-os — design preview · Correio Elegante

Preview standalone do estilo **retro-os** (Windows 9x/XP-era): o sistema
operacional *é* a interface. Todo o conteúdo vive dentro de janelas,
diálogos, ícones de desktop e uma barra de tarefas com menu Iniciar.

- `lp.html` — landing page: desktop completo. Hero como app rodando
  (`correio_elegante.exe`), seções como Bloco de notas, pasta Explorer
  (`C:\correio_elegante\momentos`) e diálogo-assistente. Janelas arrastáveis,
  minimizam/fecham de verdade, menu Iniciar funcional, relógio real.
- `card.html` — a carta como a Bia recebe: desktop com notificação piscando
  ("Você recebeu 1 nova mensagem") → clique abre a janela de e-mail com a
  carta (crush secreto, digitada ao vivo). Botões da toolbar viram
  diálogos-gag (`erro 143`, `C:\coração\bia\`).

## Paleta

| token | hex | uso |
|---|---|---|
| `--face` | `#c8c4bd` | cinza clássico das janelas/botões |
| `--face-hi` / `--face-white` | `#dfdfdf` / `#ffffff` | bevels de luz (topo/esquerda) |
| `--face-lo` / `--face-dk` | `#868a8e` / `#0a0a0a` | bevels de sombra (fundo/direita) |
| `--rose` / `--rose-d` / `--rose-l` | `#e11d48` / `#9f1239` / `#fb7185` | gradiente da title bar ativa, seleção, coração |
| `--wine` | `#4c0519` | texto principal / headlines |
| `--sky1`→`--sky2` | `#8ec8fb`→`#eaf7ff` | wallpaper (céu claro, light only) |
| `--grass1`/`--grass2` | `#cdeeb0→#a5d97f` / `#b9e39a→#8fcb6b` | colinas do wallpaper |

## Fontes (Google Fonts)

- **VT323** — títulos de janela, H1, relógio, conteúdo `.txt`, faixa do menu Iniciar. Tem ç/ã/õ.
- **Silkscreen** 400/700 — chrome pequeno: menus, botões, taskbar, labels de ícones, status bar. Tem ç/ã/õ.
- **Tahoma/Segoe UI** (system) — corpo de texto legível (parágrafos, corpo da carta).

## Design tokens extraíveis

1. **Bevel raised (janela/botão)** —
   `box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px #868a8e, inset 2px 2px #dfdfdf` sobre fundo `#c8c4bd`, `border-radius: 0` sempre.
2. **Bevel sunken (campos/áreas brancas)** —
   `box-shadow: inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px #868a8e`, fundo `#fff`.
3. **Title bar ativa** — `linear-gradient(90deg, #9f1239, #e11d48 55%, #fb7185)` + scanline
   `repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 1px, transparent 1px 2px)`; inativa: mesma estrutura em cinzas `#7d7a75→#c9c5bf`.
4. **Sombra de janela** — hard drop shadow retrô: `filter: drop-shadow(5px 6px 0 rgba(76,5,25,.16))`.
5. **Blink retrô** — atenção/notificação via `animation: blink 1.1s steps(2,start) infinite` (`50% {opacity:0}`); progresso segmentado via `repeating-linear-gradient(90deg, #e11d48 0 10px, transparent 10px 12px)`.

## Notas

- 100% light theme, zero emojis (todos os ícones são SVG `crispEdges` inline),
  zero badges/pills — o "cromado" do OS carrega o visual.
- Responsivo: ≥821px janelas absolutas/arrastáveis; ≤820px tudo vira fluxo
  em coluna, janelas full-width, taskbar com botões só-ícone.
- Sem imagens externas: wallpaper "Bliss-claro" é SVG inline com dithering.
