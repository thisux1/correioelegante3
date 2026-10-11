# PROMPT — flip-phone-sms

Brief despachado ao subagent (reconstruído):

---

Você vai criar prévias estáticas de design para o Correio Elegante — plataforma BR de páginas românticas interativas. Entregáveis em `design-previews/flip-phone-sms/`:

1. `lp.html` — landing page do produto no estilo
2. `card.html` — uma carta/página gerada "pronta" (o que o destinatário veria)
3. `README.md` — paleta (hex), fontes, tokens extraíveis

## Estilo: Celular candybar 2004 (Nokia/Motorola)

O destinatário já está no celular — levar isso à sério: telefone desenhado 100% em CSS (corpo pastel-perolado, LCD verde monocromático, teclado T9, navi-ring, softkeys, call/end, speaker grille, mic, gravação de modelo, teclas laterais de volume). Estado da arte: standby → notificação → thread SMS → menu de resposta estilo Nokia → endcard.

## Momento casado: convite / date

A `card.html` é um convite por SMS: boot → "1 mensagem nova de: [nome]" → thread com typing indicator → menu de opções (SIM / TALVEZ / OUTRO DIA) navegável por navi-ring + setas + softkeys → resposta enviada "entregue ✓" → reply do remetente → coração batendo. Bônus: T9 compose funcional com contador de chars + backspace, relógio real, beeps de tecla WebAudio.

## Restrições (marca)

- Light theme estrito — corpo do aparelho pastel claro; LCD verde-claro (não fosforescente escuro); página ao redor clara
- ZERO emojis — só ASCII de época `:)`, `<3`, `→`
- ZERO pills/badges
- Copy pt-BR teen-SMS: abreviações de T9, sem marketês
- Self-contained: HTML único, CSS/JS inline, só Google Fonts; zero imagens (telefone 100% vetor/CSS)
- Fontes: VT323/Silkscreen/DotGothic16 para LCD (latin-ext verificado)
- Mobile-first: telefone preenche 100dvh edge-to-edge em telas pequenas; `prefers-reduced-motion`
- Interações reais: softkeys funcionais, T9 compose, navegação por teclado

## Verificação obrigatória

Headless Chrome em desktop + mobile (390×844, 360×640): screenshots, DOM dumps da state machine, zero erros de console, iterar até perfeito.
