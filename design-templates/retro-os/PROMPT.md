# PROMPT — retro-os

Brief despachado ao subagent (reconstruído):

---

Você vai criar prévias estáticas de design para o Correio Elegante — plataforma BR de páginas românticas interativas. Entregáveis em `design-previews/retro-os/`:

1. `lp.html` — landing page do produto no estilo
2. `card.html` — uma carta/página gerada "pronta" (o que o destinatário veria)
3. `README.md` — paleta (hex), fontes, tokens extraíveis

## Estilo: Retro OS (Windows 9x/XP + Mac OS 9)

Desktop de sistema operacional clássico como metáfora completa: wallpaper, ícones de desktop que abrem janelas, janelas com titlebar + botões (minimizar/maximizar/fechar), taskbar com relógio real, menu iniciar, bevels raised/sunken, scanlines sutis. O conteúdo vive em janelas — `como_funciona.txt` em Notepad, `momentos/` em Explorer, CTA como wizard com barra de progresso segmentada.

## Momento casado: crush secreto

A `card.html` é "Você recebeu 1 nova mensagem": toast + envelope piscando → mail client com remetente oculto (`quemsera@mister.io`), carta typewriter nervosa não-assinada, status "lida às HH:MM". Gags de toolbar: Responder→erro, Excluir→"algumas coisas não se apagam".

## Restrições (marca)

- Light theme estrito — chrome cinza/bege clássico `#c8c4bd`, céu Bliss claro; rosa/vinho como acento de marca (titlebar ativa); nada escuro
- ZERO emojis — ícones pixel/ASCII apenas
- ZERO pills/badges — hierarquia tipográfica
- Copy pt-BR natural adolescente — nervosa, engraçada, sincera
- Self-contained: HTML único, CSS/JS inline, só Google Fonts de CDN; pixel art SVG runtime
- Fontes pixel: VT323/Silkscreen (latin-ext para ç/ã/õ); Tahoma/Verdana-like para corpo
- Mobile-first sem overflow; `prefers-reduced-motion` respeitado; colapso mobile = janelas full-width empilhadas
- Interações reais: janelas arrastáveis por pointer events, minimizar→taskbar, ícones clicáveis

## Verificação obrigatória

Renderizar headless em desktop + mobile (390px), revisar screenshots, iterar até ficar perfeito; zero erros de console. O padrão é "orgulhoso de mostrar".
