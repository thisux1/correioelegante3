# Referências de execução — "Romantic OS" pixel 2000–2010

**Escopo:** a direção já está decidida (pixel art / nostalgia digital BR 2000–2010 — Orkut, MSN, Fotolog, Lan House, Win98/XP). Este doc é só EXECUÇÃO: fontes validadas glyph-a-glyph, paletas com hex extraído, mapeamento componente-OS → bloco romântico, tokens CSS prontos e a barra de craft dos concorrentes.

**Método de validação tipográfica:** cmaps reais inspecionados via `fontTools` nos woff2 servidos pelo Google Fonts (não só "subset latin-ext" no metadata). Os caracteres testados foram `ç ã õ á à â é ê í ó ô ú ü Ç Ã Õ` + pontuação pt-BR (`' " " — … ª º ¡ ¿`) + símbolos românticos (`♥ U+2665`, `❤ U+2764`, `★ U+2605`). Números de glifos abaixo são contagens reais de cmap.

**Tokens de marca já existentes** (`frontend/src/index.css`): `--color-primary #e11d48`, `--color-primary-dark #be123c`, `--color-wine-dark #4c0519`, `--color-wine-medium #701a35`, `--color-text-muted #9f3a58`, `--color-background #fff5f7`, `--color-surface-raised #fffbfd`, `--color-paper-light #fffdfa`, `--color-accent #fda4af`, `--color-gold #d4a574`. Toda a paleta OS abaixo deriva destes.

---

## 1. Tipografia pixel com cobertura pt-BR

### 1.1 Veredicto rápido

| Papel | Fonte recomendada | Backup |
| :--- | :--- | :--- |
| Display / títulos | **Press Start 2P** (só títulos, múltiplos de 8px) | Pixelify Sans 700, Monocraft Black |
| Corpo de texto / diálogo | **VT323** (≥20px) ou **Departure Mono** | DotGothic16 (vibe JRPG) |
| Chrome de UI / labels / captions | **Silkscreen** (8–16px) | Tiny5 (micro), Micro 5 |
| Wildcards românticas | **Handjet** (`ELSH 16` = pixels em forma de coração), **Sixtyfour** (scanlines embutidas) | — |

### 1.2 Tabela completa validada

| Fonte | Onde | Pesos | Cobertura pt-BR (verificada) | Total glyphs | Licença | Uso correto |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **VT323** | Google Fonts / `@fontsource/vt323` | 400 | ✓ tudo (çãõáéê etc.) | 527 | OFL-1.1 | Corpo/diálogo ≥20px — glyphs do terminal DEC VT320 com "smear" de fósforo CRT. Condensada e leve: abaixo de ~16px fica rala. Perfeita pra texto de terminal/chat. |
| **Silkscreen** | Google Fonts / `@fontsource/silkscreen` | 400, 700 | ✓ tudo | 222 | OFL-1.1 | A fonte pixel da web 1.0 (Jason Kottke, 2001). Nativa em **8px** — usar só em múltiplos (8/16/24). Ideal pra labels de janela, captions, badges, timestamps. 700 dá hierarquia. |
| **Press Start 2P** | Google Fonts / `@fontsource/press-start-2p` | 400 | ✓ tudo (incl. grego+cirílico) | 616 | OFL-1.1 | Arcade Namco. **Só títulos e labels curtos** — é larga, espaçada e cansativa em corpo. Múltiplos de 8px. |
| **Pixelify Sans** | Google Fonts / `@fontsource/pixelify-sans` | 400–700 (variável) | ✓ tudo | 457 | OFL-1.1 | A mais versátil: 4 pesos, legível em display e texto curto. Se fosse escolher UMA fonte pra todo o produto, seria ela. |
| **Tiny5** | Google Fonts / `@fontsource/tiny5` | 400 | ✓ tudo + grego/cirílico/africano | 1 016 | OFL-1.1 | 5px nativos — a menor legível. Micro-labels, "rodapé de sistema", char counters, timestamps. Nunca corpo. |
| **Micro 5** | Google Fonts / `@fontsource/micro-5` | 400 | ✓ tudo | 322 | OFL-1.1 | Mesma função do Tiny5, desenho mais gordinho/amigável. Alternativa de gosto. |
| **DotGothic16** | Google Fonts / `@fontsource/dotgothic16` | 400 | ✓ tudo **+ tem ♥ U+2665 e ★** | 8 138 | OFL-1.1 | Pixel gótico japonês 16px — o visual de diálogo de JRPG/visual novel. Alternativa forte pra diálogos de NPC/carta. |
| **Monocraft** | GitHub `IdreesInc/Monocraft` (não está no GF) | Light→Black + itálico (9 estilos) | ✓ tudo (verificado no TTF v4.2.1) | 1 475 | OFL-1.1 | Clone da fonte do Minecraft. **Reconhecimento instantâneo pro público jovem BR** — metade do público cresceu em Minecraft. Display e corpo. Self-host obrigatório. |
| **Departure Mono** | `departuremono.com` / GitHub `rektdeckard/departure-mono` | 400 (mono) | ✓ tudo **+ tem ♥ U+2665** | 1 079 | SIL OFL-1.1 | Pixel mono lo-fi moderno (2024). Menos "época" e mais "produto 2025 com sabor retro" — boa pra corpo de texto onde VT323 fica rala demais. |
| **Handjet** | Google Fonts / `@fontsource-variable/handjet` | 100–900 + eixos `ELSH`/`ELGR` | ✓ tudo + 9 escritas | 1 234 | OFL-1.1 | Wildcard de marca: a **forma dos "tijolos" é eixo variável `ELSH` (0–16) e `ELSH 16 = CORAÇÃO`** (verificado na tabela STAT da fonte — Rosetta). `font-variation-settings: 'ELSH' 16, 'ELGR' 1` renderiza letras feitas de pixels-coração — literalmente a marca tipografada. `ELGR` 1/2 = grade simples/dupla. Uso cirúrgico (logo, palavras-chave, dia dos namorados). |
| **Sixtyfour** | Google Fonts / `@fontsource/sixtyfour` | 400 (eixos `BLED`/`SCAN`) | ✓ tudo | 261 | OFL-1.1 | Estilo LED/matriz com eixo `SCAN` que injeta scanlines **dentro dos glifos**. Display apenas — efeito CRT sem overlay. |
| **Jersey 10/15/20/25** | Google Fonts | 400 | ✓ tudo | 317 | OFL-1.1 | Pixel "camisa de time", divertido e BR-futebol. Jersey 25 é a mais legível. Alternativa display. |
| **Rubik Pixels** | Google Fonts | 400 | ✓ tudo | 630 | OFL-1.1 | Display geométrico com furos. Mais "design contemporâneo" que "nostalgia" — usar com parcimônia. |
| **Jacquard 12** | Google Fonts | 400 | ✓ tudo | 322 | OFL-1.1 | Revival de tecelagem séc. XIX — decorativa demais, destoa de OS 2000s. Skip. |

### 1.3 Eliminadas (com evidência)

| Fonte | Motivo |
| :--- | :--- |
| **BBH Sans Bartle/Bogle/Hegarty** | Apenas **121 glifos** — zero diacríticos. `ç`, `ã`, `õ`, `ª`, `º`, `¡` todos ausentes no cmap. Inválida pra pt-BR apesar de aparecer como "latin". |
| **Mundial (TipoType)** | Não é pixel — sans comercial de ~US$250. Homônimo sem relação com a estética. |
| **Px437 / Bm437 (int10h Oldschool PC Font Pack)** | CP437 **não tem `ã`/`õ`/`Ã`/`Õ`** — quebra "não", "coração". A variante **PxPlus** (~780 glifos, cobre Latin-1) resolve e é a opção mais autêntica "DOS/BIOS". Licença **CC BY-SA 4.0** — exige atribuição + share-alike; usar só se a vibe valer a licença. Fonte: int10h.org. |
| **Redaction 10** | `latin` só (sem latin-ext) e não é pixel. |
| **W95FA** (remake MS Sans Serif) | Não verificada glyph-a-glyph; FontsArena lista como free. Alternativa pra authenticidade Win98 em texto corrido — **verificar licença e cmap antes de adotar**. |

### 1.4 Notas de implementação

- Todas as do Google Fonts entram via `@fontsource/*` (self-host, já temos Vite+npm — sem CDN em runtime). `unicode-range` cuida do split latin/latin-ext automaticamente.
- **Regra de ouro de tamanho:** pixel font em tamanho não-múltiplo vira borracha. Silkscreen/Tiny5/Micro5 em múltiplos exatos do grid nativo (8px, 5px); Press Start 2P em múltiplos de 8.
- `-webkit-font-smoothing: none` / `font-smooth: never` (nonstandard, WebKit) aumenta a crocância em tamanhos nativos; testar no Safari/iOS.
- Fallbacks: declarar `monospace` e `system-ui` após cada pixel font — se o woff2 falhar, o layout não pode depender de métricas exóticas.
- Line-height: múltiplo da unidade pixel (`--px`), senão a grade quebra entre linhas.

---

## 2. Sistemas de cor retro → mapeamento pra paleta rose

### 2.1 Windows 98 — o sistema de bevel canônico

Hexes extraídos de `.theme` oficial + 98.css:

| Papel (nome do sistema) | Original | Equivalente "Rosé OS" |
| :--- | :--- | :--- |
| `ButtonFace` (face de janela/diálogo) | `#C0C0C0` silver | `#FFFDFA` creme (=`--color-paper-light`) ou `#FFF5F7` blush |
| `ButtonHilight` (bevel claro externo) | `#FFFFFF` | `#FFFFFF` (inalterado) |
| `ButtonLight` (bevel claro interno) | `#DFDFDF` | `#FFE4EC` |
| `ButtonShadow` (bevel escuro interno) | `#808080` | `#9F3A58` (=`--color-text-muted`) |
| `ButtonDkShadow` (bevel escuro externo) | `#0A0A0A` | `#4C0519` (=`--color-wine-dark`) |
| `ActiveTitle` (barra de título ativa) | `#000080` navy → gradiente `#1084D0` | `#BE123C` → `#E11D48` (ou vinho `#4C0519`→`#BE123C` p/ janela "principal") |
| `InactiveTitle` | `#808080`→`#B5B5B5` | `#FDA4AF`→`#FECDD3` (desbotado mas ainda rosa) |
| `TitleText` | `#FFFFFF` | `#FFF5F7` |
| `Hilight` / `HilightText` (seleção) | `#000080` / `#FFFFFF` | `#E11D48` / `#FFFFFF` |
| `Window` / `WindowText` | `#FFFFFF` / `#000000` | `#FFFFFF` / `#4C0519` |
| `InfoWindow` (tooltip amarelinho) | `#FFFFE1` | `#FFE4EC` |
| Desktop (papel de parede) | `#008080` teal | Gradiente blush `#FFE4EC`→`#FFF5F7` com dithering; teal fica como "tema alternativo" |
| `GrayText` (desabilitado) | `#808080` | `#C98096`-ish (rosa acinzentado, ~40% sat. de `#9F3A58`) |

**Leitura:** o Win98 é um sistema de **5 bevels + 1 acento de título + 1 desktop**. Recolorir = trocar o neutro frio (silver/gray) por neutro quente (creme/blush) e o acento (navy) por rose/vinho. A estrutura de contraste NÃO muda: luz sempre top-left, sombra bottom-right, contorno escuro mais externo.

### 2.2 Windows XP Luna — o primo bege

| Elemento | Original | Nota |
| :--- | :--- | :--- |
| Face de diálogo | `#ECE9D8` bege | **É o antecessor direto do nosso creme** — XP já prova que chrome bege funciona. Nosso `#FFFDFA` é o `#ECE9D8` clareado. |
| Title bar | Gradiente azul `#0058E6`→`#3A93FF` com brilho | Luna introduz gradientes multi-stop (XP.css usa 4–8 stops). Pra nós: gradiente vinho→rose com 1 stop de brilho `#FB7185` no topo. |
| Start button | Verde gradiente | Verde é "proibido" pra nós — nosso "Iniciar" é um coração rosa (`#E11D48`). |
| Scrollbar/track | `#ECE9D8` sobre `#F1EFE2` | Manter creme + trilha `#FFF5F7`. |

### 2.3 Orkut — azul + pink + branco (a âncora BR mais forte)

Paleta extraída de capturas (COLOURlovers "orkut color style" + screenshots 2004–2007):

- `#89B1D6` azul acinzentado (barras/headers)
- `#B4D1EC` azul claro (hover/secondary)
- `#E2E8FD` azul-brilho (fundo de página)
- `#E95B95` **pink Orkut** (logo, links de ação, barras de perfil)
- `#F6ECB2` amarelo-pálido (avisos "você tem novos scraps")

**Por que importa:** Orkut já era **azul + pink em fundo claro** — a metáfora "rede social rosa" não é invenção nossa, é memória. Nossa paleta troca o azul pelo vinho e sobe o pink pra `#E11D48`/`#E95B95`-adjacente — o equivalente Orkut do nosso `primary` é quase idêntico (`#E95B95` vs `#E11D48`; o deles mais magenta, o nosso mais vinho). Detalhes autênticos a copiar: scraps com HTML+emoticons `[red]...[:)]` (→ typed-codes que renderizam sprites), as **3 barras de perfil** ("sexy/cool/trustworthy" em degradê rosa — vira nosso medidor romântico), avisos amarelo-pálido discretos, foto de perfil pequena com borda azul.

### 2.4 MSN / Windows Live Messenger

- Chrome azul-claro (gradiente frio), área de conversa **branca**, header "Para: nome <email>" sobre faixa azul.
- Display pics 96×96 no canto inferior direito.
- Nome de exibição + mensagem pessoal (subnick) em cinza abaixo — antecessor do "status".
- "X está digitando uma mensagem" na barra de status — o micro-copy mais replicável da história.
- Emoticons amarelos (#FFDD55-ish) com códigos tipados — **lista oficial romântica validada** (fonte: bernzrdo/msn-emoticons):
  `(L)` coração vermelho · `(U)` coração partido · `(F)` rosa vermelha · `(K)` boca/beijo · `({)` `(})` abraço · `(*)` estrela · `(8)` nota musical · `(G)` presente · `(E)` envelope/e-mail · `(H)` smile de óculos · `:'(` choro animado · `:]` apaixonado.
  → **Token de produto:** o editor pode aceitar esses códigos nos textos e renderizar sprites pixel correspondentes. Isso é nostalgia operável, não só estética.

### 2.5 Outras âncoras culturais (referência de mood, não de hex)

- **Fotolog:** header azul-céu, foto grande + legenda + guestbook embaixo, sidebar "Friends & Favorites". Metáfora: "um post por dia, todo mundo comenta".
- **ICQ:** flor verde de 8 pétalas, som "uh-oh!", lista com status. Só como easter egg sonoro.
- **Winamp:** o media player da era — skin escura+verde neon é dark (não usar), mas o *formato* (equalizador, playlist, botões físicos) mapeia 1:1 pro nosso bloco de música.
- **Lan House:** monitor bege CRT, papel de parede azul-padrão, teclado barulhento. O contexto WHERE a nostalgia acontecia — boa copy de ambientação ("como na lan house, sem sair do celular").

---

## 3. Biblioteca de referências visuais — componente OS → bloco romântico

Moodboard textual. Cada item: **metáfora de interface** → **bloco/elemento no Correio Elegante**.

1. **Janela com title bar** (min/max/close decorativos) → wrapper de QUALQUER bloco: a página inteira é um desktop onde cada carta/foto/quiz é uma janela nomeada ("mensagem.txt", "nossa_foto.bmp", "pergunta.exe"). Botões da title bar podem ser decorativos ou funcionais (minimizar = colapsar bloco).
2. **Dialog de confirmação OK/Cancel** → o pedido romântico (declaração/namoro): dialog centralizado com botões — e aqui a mecânica própria: **ambos os botões dizem SIM** ("Sim" / "Claro que sim"), ou o "Não" foge do cursor. Único "erro de sistema" que o amor permite.
3. **MSN chat window** → bloco de conversa: mensagens alternadas com "(L)" renderizando coração pixel, display pic do casal, rodapé "fulana está digitando…". Ideal pro momento "relembre nossa primeira conversa" ou pra carta em formato de chat.
4. **Nudge/atenção do MSN** (sacode a janela inteira + som) → micro-interação de botão "chamar atenção": clica → a janela inteira treme com `transform` em `steps()` + blip. Easter egg entre blocos.
5. **Orkut scrapbook** → guestbook/mural: cada mensagem = scrap com foto pequena + nome + texto + timestamp ("às 22:47 de 14/02"). Perfeito pro bloco de mensagens de convidados (RSVP/wishes).
6. **Orkut depoimento** (só aparece após aprovação do dono) → bloco de carta/votos longos: "depoimento" com selo de aprovação. Copy do fluxo: "visível somente após aprovação" = mecânica real de moderação romântica.
7. **Orkut barras de perfil** (sexy/cool/trustworthy em 3 barras degradê) → **medidor de compatibilidade/amor**: 3 barras pixel rotuladas "romântico / engraçado / companheiro" preenchidas 100% — ou o quiz revela %.
8. **Fotolog photo page** → bloco de foto polaroid-era: imagem grande + legenda manuscrita embaixo + comentários/guestbook. Caption em pixel pequeno (Silkscreen 8px), moldura = janela.
9. **Guestbook HTML 1.0** (assine o livro de visitas) → bloco de assinaturas simples: nome + mensagem + data, com contador "visitas: 1.337" estilo hit counter.
10. **Progress bar em blocos** (Win98 segmented, não contínua) → bloco timer/countdown: "carregando memórias… 87%" com tijolos `#E11D48` saltando em `steps()`; também serve como transição de seção.
11. **Taskbar + menu Iniciar** → navbar/footer fixa mobile: botão "Iniciar" com coração abre menu listando seções da página ("Nossa história", "Fotos", "Recado"); relógio na taskbar mostrando hora real.
12. **Desktop icons com label** → navegação de seções no topo: ícones sprite pixel (envelope, fotos, música) com label embaixo — double-click/mobile tap abre a "janela" da seção.
13. **Tooltip amarelinho Win98** (`#FFFFE1`→`#FFE4EC`) → hints do quiz/segredos: hover/toque longo em áreas revela dica em tooltip pixel ("Dica: foi no cinema em 2019").
14. **Cursor hourglass / ampulheta** → estado de loading: cursor troca pra sprite de ampulheta pixel enquanto mídia carrega; também cursor `wait` customizado.
15. **MSN display-name + status online** → header do casal: "Lia & Rafa — online um pro outro desde 12/03/2022" com bolinha de status verde→rosa e contador "tempo juntos" (o meupresente faz isso ao vivo: "4 anos, 3 meses e 29 dias").
16. **Error dialog paródico** → empty/error states: "Erro 404: razão pra não te amar não encontrada [OK]". Usar com parcimônia — 1 por página no máximo.
17. **Winamp/equalizador** → bloco de música: player com espectro animado em barras pixel, playlist "trilha do relacionamento", botões físicos ▶⏸⏭.

**Bônus — typed codes:** no editor e nas mensagens, suportar códigos `(L)`, `(F)`, `<3`, `[:)]` que renderizam sprites pixel (coração, rosa, smile). É o casamento das convenções Orkut `[code]` + MSN `(code)` — nostalgia que o usuário *digita* sem perceber.

---

## 4. Tokens extraíveis (CSS-ready)

### 4.1 Bevel Win98 — a técnica central (do 98.css, 4 inset shadows)

```css
:root {
  --px: 2px;                          /* unidade pixel base */
  /* cores de bevel derivadas da marca */
  --bevel-hi:    #ffffff;
  --bevel-light: #ffe4ec;
  --bevel-dark:  #9f3a58;
  --bevel-dk:    #4c0519;

  --bevel-out:
    inset -1px -1px var(--bevel-dk),     /* canto externo: escuro embaixo/direita */
    inset  1px  1px var(--bevel-hi),     /* canto externo: luz em cima/esquerda  */
    inset -2px -2px var(--bevel-dark),   /* anel interno: sombra */
    inset  2px  2px var(--bevel-light);  /* anel interno: luz */
  --bevel-in:                            /* pressed/input: cores trocadas */
    inset -1px -1px var(--bevel-hi),
    inset  1px  1px var(--bevel-dark),
    inset -2px -2px var(--bevel-light),
    inset  2px  2px var(--bevel-dk);
}
/* regra: raised = --bevel-out; :active/pressed/inputs = --bevel-in. A fonte de luz NUNCA muda de lugar, só inverte. */
```

### 4.2 Sombra dura stepped (estilo NES.css, sem blur)

```css
--shadow-hard: 4px 4px 0 var(--color-wine-dark);   /* drop shadow 8-bit */
--shadow-hard-sm: 2px 2px 0 var(--color-wine-dark);
/* NES.css usa ::after expandido -4px com inset shadow como "profundidade":
   hover aprofunda (-6px), active INVERTE (+4px no top-left = afundou).
   Zero transform → nada sai do pixel grid. */
```

### 4.3 Borda pixel com cantos em degrau

Dois métodos (usar ambos por contexto):
- **`border-image` SVG 9-slice** (método NES.css): SVG 5×5 inline com cantos preenchidos e centro vazio, `border-image-slice` em múltiplos de `--px`. Melhor pra janelas/cards.
- **`clip-path` com degraus** pra cantos chanfrados 1-px (efeito "canto mastigado" de sprite):

```css
--corner-notch: polygon(
  0 4px, 4px 4px, 4px 0,
  calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
  100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px),
  calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px));
```

### 4.4 Dithering (gradiente honesto de época)

```css
/* checkerboard 50% — o "gradiente" que a era permitia */
--dither-50:
  linear-gradient(45deg, var(--c) 25%, transparent 25%, transparent 75%, var(--c) 75%),
  linear-gradient(45deg, var(--c) 25%, transparent 25%, transparent 75%, var(--c) 75%);
  /* background-size: 2px 2px; position: 0 0, 1px 1px; */
/* Bayer 4×4 pra densidades 25/75%: PNG data-uri 4px + image-rendering: pixelated.
   Uso: title bars em gradiente, sky do "desktop", sombreamento de sprites. */
```

### 4.5 Scanlines / CRT (overlay, sempre opcional)

```css
--scanlines: repeating-linear-gradient(
  to bottom, transparent 0 2px, rgb(76 5 25 / .04) 2px 3px);
/* respeitar prefers-reduced-motion e um toggle; nunca como muleta de "retro" */
```

### 4.6 Cursores

```css
cursor: url("/cursors/pixel-arrow.png") 2 2, default;
cursor: url("/cursors/pixel-hand.png") 4 2, pointer;
/* hourglass pro :has(.loading) — sprites .png 16-32px com image-rendering: pixelated;
   fallback nativo sempre declarado (iOS ignora url() sem fallback confiável) */
```

### 4.7 Micro-tokens de comportamento

```css
--ease-step: steps(4, end);            /* movimento em frames, nunca lerp suave */
--caret-blink: steps(1) 1s infinite;   /* cursor typewriter piscando duro */
image-rendering: pixelated;            /* TODA imagem/sprite escalada */
font-smooth: never;                    /* webkit-only, tamanhos nativos */
/* foco acessível fiel à época: retângulo pontilhado */
outline: 1px dotted var(--color-wine-dark); outline-offset: -4px;
/* progress bar em blocos: repeating-linear-gradient com hard stops a cada --px */
```

### 4.8 O que NÃO vira token (anti-patterns)

- `border-radius` > `--px` em chrome OS (cantos redondos grandes matam a ilusão; 1-2px máximo).
- `box-shadow` com blur/spread suave — sombra da era é sólida e deslocada.
- `linear-gradient` suave em superfícies — usar stops duros ou dither.
- Animações `ease-in-out` em sprites — `steps()` ou transform inteiro.

---

## 5. Craft bar dos concorrentes — "artesanal" vs "preguiçoso"

### 5.1 meupresente.app (concorrente direto BR — detalhes em `design-research/meupresente/NOTES.md`)

O que eles fazem que é **artesanal** e vale superar/igualar:

- **Estados completos em tudo**: o customizador de sprite tem poses (frente/costas/lados × parado/andando), botão "Testar caminhada", "Aleatorizar", "Restaurar inicial". Nada existe só no estado default.
- **Preview contextual permanente**: cada campo do wizard diz exatamente onde aparece no jogo ("Na placa do café, fase 2"); cada tema declara 5 atributos (cenário/luz/enfeites/interface/música) com preview de áudio "Ouvir a trilha".
- **Fallback explícito**: painel "Se ficar em branco" mostra o texto neutro exato — transparência total.
- **O mundo reage ao progresso**: bandeirinhas acendem, foto vai pra parede do café — feedback de progresso ambiental, sem HUD.
- **Placa com os nomes**: "Café Lia & Rafa" — personalização espacial, não só textual.
- **Copy calorosa em TODO microtexto**: "leva uns vinte minutinhos", "a casa é sua", "as xícaras são por conta da casa".
- **Acessibilidade de verdade em pixel**: live regions narrando progresso ("Lembrança guardada — Café Bem-Te-Vi"), skip links, `prefers-reduced-motion`, drag reordenável **por teclado** (espaço pega, setas movem, Esc cancela). Prova que craft pixel e a11y coexistem.
- **Contador "tempo juntos" ao vivo** ("4 anos, 3 meses e 29 dias") — computado, não estático.

### 5.2 Outros benchmarks de craft retro-web

- **Poolside.fm** (OS retro como site): o designer disse ao TNW — *"we put in extra effort to get the typography and pixel rendering true to that form"*. Janelas arrastáveis, 5 temas de cor, tudo em pixel fiel. Lição: a credibilidade vem de tipografia+renderização corretas, não de mais efeitos.
- **Windows93.net**: OS completo paródico em browser — apps de verdade, sons, cursores, desktop inteiro coerente. O nível de simulação total (até app rodando a si mesmo) é o teto de imersão.
- **jspaint.app** (1j01/98.js): MS Paint pixel-perfeito incluindo menus, diálogos, atalhos de teclado e até o arquivo de ajuda. Craft = cobrir TODOS os estados e edge cases da metáfora, incluindo os invisíveis.
- **98.css / XP.css / NES.css**: as libs provam que a técnica certa (bevel de 4 insets, ::after de profundidade, border-image 9-slice) já resolve 80% do visual — o resto é conteúdo e micro-interação.

### 5.3 Checklist "artesanal × preguiçoso" (usar em review de UI)

| Artesanal (fazer) | Preguiçoso (flagrar em review) |
| :--- | :--- |
| Um fator de escala inteiro pra sprites (×2 ou ×3), todos os px no mesmo grid | Sprites com tamanhos de pixel inconsistentes (2px num elemento, 3px noutro) |
| `image-rendering: pixelated` em toda imagem escalada | Sprite borrado por upscale bilinear |
| Todos os estados: default/hover/pressed/disabled/focus | Só o estado default estilizado |
| Luz sempre top-left / sombra bottom-right em TODOS os bevels | Bevels com direção de luz aleatória entre componentes |
| Fonte pixel em múltiplos do grid nativo; line-height múltiplo de `--px` | Pixel font em 13px/17px/1.45lh virando borrão |
| Animação em `steps()` ou transform de pixels inteiros | Sprite deslizando com `cubic-bezier` suave (quebra a ilusão) |
| Dithering/stops duros pra gradiente | `linear-gradient` suave em "superfície retro" |
| Sounds de UI discretos (blip de clique, ding de mensagem) com opt-out | Silêncio total ou áudio obrigatório |
| Cursor customizado com fallback | Cursor padrão do OS em cima de UI pixel |
| Emoji-code `(L)` renderizando sprite próprio | Emoji nativo do OS no meio do pixel art (quebra tudo) |
| A11y: `prefers-reduced-motion`, focus visível pontilhado, live regions | Pixel art como desculpa pra ignorar a11y |
| Copy de sistema em pt-BR ("Salvar", "Abrir", "Erro", "OK", "Carregando…") | Copy genérica misturada com inglês ou tom "corporativo" |
| CRT/scanline como overlay opcional | Scanline pesada cobrindo UI mal-feita (muleta) |
| Tap targets ≥44px (escala o sprite, não o grid) | Botões de 8px inalcançáveis no mobile |

### 5.4 Lacunas que o meupresente NÃO cobre (nossa vantagem)

- Eles são **um** formato (mundo RPG); nosso "romantic OS" é metaforicamente mais rico — janelas/MSN/Orkut mapeiam pra qualquer momento (crush anônimo, RSVP, pedido).
- RSVP/reply real não existe lá — nosso chat-MSN + guestbook-Orkut com resposta de verdade é diferencial.
- O chrome deles é "jogo"; o nosso é "sistema operacional" — o que habilita toda a camada de janelas arrastáveis, taskbar, desktop icons, typed-codes.

---

## Fontes consultadas

- Glyph coverage: inspeção direta de cmap via fontTools nos woff2 do Google Fonts + TTFs oficiais (Monocraft v4.2.1, Departure Mono v1.500).
- Fontsource API (`api.fontsource.org/v1/fonts/*`): subsets/pesos/licenças de todas as fontes GF.
- Win98 system colors: `1j01/98` `.theme` files + tabela GetSysColors + desktopcolors.com.
- 98.css (jdan), XP.css (botoxparty), NES.css (nostalgic-css) + análises Stranglehold/Exocortex ui_references.
- Orkut: COLOURlovers "orkut color style", screenshots 2007, Wired (história), convenções de scraps `[red]`/`[:)]`.
- MSN emoticons: `bernzrdo/msn-emoticons` (lista oficial com atalhos), Crissov/unicode-proposals.
- int10h.org Oldschool PC Font Pack readme (Px437 vs PxPlus, licença CC BY-SA 4.0).
- meupresente: `design-research/meupresente/NOTES.md` + 30 screenshots em `meupresente/mp-*.png`.
- Poolside.fm (TNW 2019), Windows93 (Wikipedia + site), MDN `image-rendering`.
