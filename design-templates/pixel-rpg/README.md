# pixel-rpg — Correio Elegante design preview

16-bit JRPG romance: title-screen landing page + playable "pedido de namoro" quest.
Théo (nervous quest-giver NPC) asks Mel to date him — typewriter dialog, heart-HP HUD,
quest log, YES/YES choice menu, celebration fanfare.

**Files**
- `lp.html` — landing page: title screen hero, NPC dialog, quest log, inventory of features, stat buffs, side quests, shop, CTA as dialog choice.
- `card.html` — the generated letter: full RPG scene (pastel overworld, pixel sprites, HUD hearts, quest log, choices, pixel-heart confetti, "QUEST COMPLETA").

## Palette

| role | hex |
| --- | --- |
| ink (text/borders) | `#4c0519` |
| ink-soft (secondary) | `#701a35` |
| cream (dialog bg) | `#fff7e0` |
| cream-deep (inner bezel) | `#ffeec4` |
| rose (primary action/hearts) | `#e11d48` |
| rose-2 (bar fill edge) | `#f43f5e` |
| rose-pale / ghost (empty hearts, soft fills) | `#fda4af` / `#f3c2ce` |
| gold (banner, exclaim, star) | `#f2b134` |
| sky | `#9fd8f7` → `#dff3fe` |
| grass | `#b5e8ab` → `#93d48c` → `#5fae62` |
| skin / hair (Théo) / hair (Mel) | `#ffd0a3` / `#6b4226` / `#8a3b5c` |

## Fonts

- **Press Start 2P** — short titles only (`CORREIO ELEGANTE`, `QUEST COMPLETA!`, stat values). Never for body text.
- **Silkscreen 400/700** — UI chrome: menu items, nameplates, quest labels, buttons. Always uppercase, letter-spaced.
- **VT323** — dialog/body text at 1.35–1.7rem. Full pt-BR glyph coverage (ç/ã/õ/é).

## Extractable design tokens

1. **`--panel8` frame** — the signature 8-bit double border:
   `border:4px solid #4c0519` + `box-shadow: inset 0 0 0 4px #ffeec4, inset 0 0 0 6px #4c0519, 7px 7px 0 rgba(76,5,25,.18)` (outer ink line, cream ring, thin inner ink line, hard drop shadow).
2. **Stepped motion** — all animation uses `steps(n)` easing (bob `steps(2)`, walk `steps(9)`, blinks `steps(1)`, bar fills `steps(12)`) for authentic sprite motion. Never smooth easing.
3. **Sprite-as-data** — characters/icons authored as ASCII maps → tiny JS renderer emits crisp-edged SVG (`shape-rendering:crispEdges`). Palette swaps = variants (heart full/empty/gold).
4. **Dialog anatomy** — cream `.panel8` box + `.nameplate` (rose tag offset on the border) + VT323 typewriter text + blinking pixel-triangle `▼` advance cursor + right-anchored choice menu with `▶` selector.
5. **Heart HP pattern** — hearts as UI meter: empty `#f3c2ce` silhouette fills to `#e11d48`, celebration flashes gold; single `pop` animation on each fill (`scale(1.45) rotate(-8deg)`, `steps(3)`).
