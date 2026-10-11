# PROMPT — orkut-msn

Brief despachado ao subagent (reconstruído):

---

Você vai criar prévias estáticas de design para o Correio Elegante — plataforma BR de páginas românticas interativas. Entregáveis em `design-previews/orkut-msn/`:

1. `lp.html` — landing page do produto no estilo
2. `card.html` — uma carta/página gerada "pronta" (o que o destinatário veria)
3. `README.md` — paleta (hex), fontes, tokens extraíveis

## Estilo: Orkut × MSN Messenger (2005–2008)

O ancestral cultural do produto no Brasil: depoimentos de Orkut eram correio elegante digital. Âncoras visuais: chrome lilás/lavanda do Orkut, gradiente de titlebar do MSN, avatar pixel, karma bars (confiável/legal/sexy), "escrever depoimento", janela de conversa com "chamar atenção" (nudge), "está digitando…", emoticons ASCII da era (`<3`, `:)`).

## Momento casado: carta de amor

A `card.html` é um depoimento de Orkut — texto caloroso coloquial pt-BR com a seriedade cômica da era ("valeu por aprovar meu depoimento").

## Restrições (marca)

- Light theme estrito — lavanda/creme/rosa claros; roxo só como acento; nada de fundo escuro ou card escuro
- ZERO emojis — corações e carinhas só como pixel art SVG ou ASCII de época
- ZERO pills/badges de marketing — hierarquia tipográfica
- Copy pt-BR natural adolescente — engraçada, sincera, nunca marketês
- Self-contained: HTML único, CSS/JS inline, só Google Fonts de CDN; todo pixel art gerado em runtime (SVG/data-URI)
- Fontes pixel: VT323 / Silkscreen (verificar cobertura latin-ext para ç/ã/õ); fonte legível para corpo
- Mobile-first, sem overflow horizontal; `prefers-reduced-motion` respeitado
- Interações reais onde couber (janela MSN funcional, nudge que balança, form de depoimento)

## Verificação obrigatória

Renderizar headless em desktop + mobile (390px), revisar screenshots, iterar até ficar perfeito; zero erros de console. Itere quantas vezes precisar — o padrão é "orgulhoso de mostrar".
