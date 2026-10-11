# PROMPT — pixel-rpg

Brief despachado ao subagent (reconstruído):

---

Você vai criar prévias estáticas de design para o Correio Elegante — plataforma BR de páginas românticas interativas. Entregáveis em `design-previews/pixel-rpg/`:

1. `lp.html` — landing page do produto no estilo
2. `card.html` — uma carta/página gerada "pronta" (o que o destinatário veria)
3. `README.md` — paleta (hex), fontes, tokens extraíveis

## Estilo: JRPG 16-bit (Pokémon/Final Fantasy era SNES-GBA)

Title screen + overworld: menu com cursor ▸ navegável (teclado + toque), quest log, inventário com itens inspecionáveis, status/stat bars, NPC com dialog typewriter, painéis com borda dupla 8-bit, motion em `steps()`. Referência de produto: meupresente.app usa mundo semi-aberto tipo Pokémon — vale a pena superar.

## Momento casado: pedido de namoro

A `card.html` é uma quest jogável: NPC remetente com "!" sobre a cabeça → dialog typewriter (blips chiptune WebAudio, toggle de som) → heart-HP enchendo por linha → a pergunta → menu de escolhas SIM/SIM → celebração (flash, corações dourados, confete pixel, "QUEST COMPLETA!") → menu final com replay e "criar a minha".

## Restrições (marca)

- Light theme estrito — overworld pastel: grama clara, céu claro, sol; sem dungeons escuras
- ZERO emojis — corações/estrelas são pixel sprites SVG
- ZERO pills/badges
- Copy pt-BR adolescente — nervosa, divertida, romântica
- Self-contained: HTML único, CSS/JS inline, só Google Fonts; sprites via ASCII-map→SVG runtime ou CSS
- Fontes: Press Start 2P só títulos grandes; Silkscreen UI; VT323 dialog (latin-ext verificado)
- Mobile-first sem overflow; `prefers-reduced-motion` respeitado; bezel de handheld só em desktop
- Interações reais: menu por teclado, dialog skippable, escolhas funcionais, replay

## Verificação obrigatória

Playwright/headless: fluxo completo end-to-end (dialog→pergunta→escolha→celebração) em 360px/390px/desktop; zero erros JS; light theme por amostragem; iterar até perfeito.
