# Orkut × MSN — Correio Elegante (preview)

Nostalgia brasileira 2005–2011 re-paletada para romance: a estética de perfil do Orkut (parede de depoimentos, foto emoldurada, karma "confiável/legal/sexy", grid de amigos e comunidades) + o chrome do MSN Messenger (janela de conversa, "chamar atenção", bolinha de status, toast de notificação). Depoimentos eram literalmente cartas de amor em perfil — o momento perfeito pra marca.

## Arquivos

- `lp.html` — landing page: hero com janela de conversa MSN funcional (nudge balança a janela, input responde, "digitando…" animado), "como funciona" em 3 recados, showcase de mini-perfil, depoimentos de clientes no formato depoimento, CTA. Linka para `card.html`.
- `card.html` — página gerada (Rafa → Duda): perfil estilo Orkut com retrato pixel-art, karma bars, menu de ações, depoimento-carta de amor com botão "amei" (47→48) e carinhas de amigas, form "escreva um depoimento" (com aviso de aprovação), grid de amigos/fãs, comunidades, e toast MSN "Duda acabou de ler seu depoimento".

## Paleta (light theme — roxo só como acento)

| Uso | Hex |
|---|---|
| Fundo lilás-claro + pontinhos | `#f4eefb` / `#e4d6f6` |
| Superfícies | `#ffffff`, `#faf6ff` |
| Bordas / separadores | `#d9c9ec`, `#e9def7`, pontilhado `#d8cbe8` |
| Roxo Orkut | `#7a3fa8` (ação), `#4e2470` (títulos), `#6a2fa0` (links) |
| Rosa depoimento | `#d9439f`, `#a01f6e`, suave `#f6d7ea` |
| Azul MSN (chrome) | `#3f7ec4`, `#2c5f9e`, linhas `#9fc0e0`, fundo `#eaf1fa` |
| Status / mão do nudge | verde `#57b25e`, dourado `#ffd94a` |
| Texto | `#3a2350` tinta, `#6f5a86` suave, `#8f7ba3` muted |
| Karma bars | `#7fa8d8` confiável, `#7ac18a` legal, `#e58bb0` sexy |

## Fontes (Google Fonts — latin-ext, ç/ã/õ OK)

- **Silkscreen** (400/700) — wordmark, nav, títulos de painel, botões, números. Pixel UI pura.
- **VT323** — timestamps, contagens, micro-datas. Terminal retrô.
- **Verdana** (system) — corpo. É a fonte real que o Orkut usava; autêntica e legível.

## Pixel art

Tudo desenhado em código — nenhuma imagem externa:

- **Coração pixel 9×8** (SVG path único, reutilizado em logo, títulos, botão "amei", toast):
  `M1 0h2v1H1zM6 0h2v1H6zM0 1h4v1H0zM5 1h4v1H5zM0 2h9v1H0zM0 3h9v1H0zM1 4h7v1H1zM2 5h5v1H2zM3 6h3v1H3zM4 7h1v1H4z`
- **Retratos/avatares**: grade `data-art` (strings `/`-separadas) + `data-pal` (JSON cor por caractere) renderizados via painter JS → `<svg>` com `shape-rendering:crispEdges`. Duda e Rafa são 16×16; amigos usam um template 10×7 com paleta variável (cabelo/pele/camisa).

## Tokens extraíveis

```css
--panel-orkut:   #fff + border 1px #d9c9ec + radius 8px
                 + header linear-gradient(#f3ebfd,#e4d5f7) + border-bottom
--btn-bevel:     gradient + border + inset 0 1px 0 rgba(255,255,255,.5)
                 + 0 2px 0 <cor-sombra>; :active translateY(1px)
--dot-sep:       border-bottom 1px dotted #d8cbe8 (listas/recados)
--msn-titlebar:  linear-gradient(#f8fbfe,#cfe0f2 48%,#b6d0ea) + #9fc0e0
--status-dot:    9px round, bg #57b25e, border rgba(0,0,0,.25), glow leve
--bg-dots:       radial-gradient(#e4d6f6 1px, transparent 1.2px) / 22px 22px
```

- **Nudge shake**: `@keyframes nudge` — translate+rotate em 6 fases, .55s, aplicada à `.msn.shake`.
- **Painter pixel**: `per[color] += 'M x y h1v1h-1z'` por célula → um `<path>` por cor.

## Performance

Zero imagens externas (só Google Fonts); pixel art é SVG gerado em runtime; animações só via `transform`/`opacity`; `prefers-reduced-motion` desliga shake e dots. Mobile-first; grid 3 colunas só ≥980px.
