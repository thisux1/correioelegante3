# Inventário — 6 prévias de design (`design-previews/`)

> Leitura completa das 6 prévias (lp + card + README cada, ~9.580 linhas de HTML/CSS/JS).
> Objetivo: decompor cada elemento/interação em blocos parametrizáveis do editor e em
> primitivos compartilhados do sistema **"romantic OS"** (pixel/nostalgia-2000s, chrome
> retro + acentos rosa-vinho, light theme).
>
> Legenda de esforço React: **S** = prop/estilo trivial; **M** = componente com estado;
> **L** = runtime/engenharia própria.

---

## 1. orkut-msn — "carta de amor como depoimento"

| Elemento / interação | Origem | Técnica | Esforço | Destino |
|---|---|---|---|---|
| Topbar + tabs estilo Orkut (início/como funciona/depoimentos com contadores) | lp ~L430-460 | CSS | S | chrome LP / `text` |
| Janela MSN: titlebar azul, bolinha "online", subheader "Para:", área de chat, toolbar (emoticons/foto), input fake + Enviar | lp ~L480-560 | CSS+JS (fake send, bot responde) | M | shell + scripted chat → runtime |
| **"Chamar atenção" (nudge)** — sacode a janela | lp ~L555 | `@keyframes nudge` (translate+rotate 6 fases, .55s) + JS | S | prop `shakeOnClick` (attention cue) |
| **"digitando…"** — 3 dots com blink defasado | lp/card | CSS `.tdots` | S | indicador de typing (chat playback) |
| Link-card dentro do chat (borda dashed + coração pixel + url) | lp ~L540 | CSS | S | `text`/`envelope` teaser |
| **Pixel painter**: `data-art`/`data-pal` → SVG path por cor | lp ~L636-715, card ~L667-719 | JS runtime (~30 linhas) | S | **`PixelSprite`** compartilhado |
| Coração pixel 9×8 (SVG path) | ambos | SVG inline | S | glyph canônico do sistema |
| Profile card Orkut: photo frame + avatar pixel + facts + **karma bars** (confiável/legal/sexy) | card ~L460-540 | CSS + pixel painter | M | `freezone`/profile → **meters** (lacuna) |
| Menu de ações (enviar mensagem, adicionar, ver recados…) | card ~L430 | CSS lista | S | `text` list |
| Depoimento-carta (avatar lateral, nome+data, corpo, P.S. dotted) | card ~L545-575 | CSS | S | `text` (category `body`/`signature`) |
| **"amei" toggle** com contador 47→48 | card ~L575 | JS ~10 linhas | S | **reaction** (lacuna pequena) |
| Faces row (mini avatares + "N amigas acharam fofo") | card ~L578 | CSS | S | social proof → `text` |
| Form "escreva um depoimento" + aviso de aprovação | card ~L580 | markup | S | **guestbook** (lacuna — ver §4) |
| Grid amigos/fãs (8 avatares pixel com palette swap) | card ~L590 | pixel painter | S | `PixelSprite` + grid |
| Comunidades (nome + membros VT323) | card ~L600 | CSS | S | `text` |
| **Toast MSN** bottom-right ("Duda acabou de ler…", auto 1.4s, X fecha) | card ~L640 | CSS+JS | M | **toast/notification** compartilhado |
| Notice "só aceita depoimentos de amigos" | card | CSS | S | `text` fineprint |

**Observações**: paleta lilás `#e0e8ff`/`#7f7fd5` + pink `#ff6699` — fora do rosa-vinho
decidido; o conteúdo (depoimento, karma, comunidade) é mais valioso que o chrome.

---

## 2. retro-os — "crush secreto como sistema operacional"

| Elemento / interação | Origem | Técnica | Esforço | Destino |
|---|---|---|---|---|
| Wallpaper "Bliss claro" (céu, sol, nuvens pixel, colinas, dithering) | lp | SVG inline | S | asset de tema / `image` |
| **Desktop icons** (44px SVG + label, seleção, dblclick/tap-duplo abre) | lp ~L789-860 | JS+CSS | M | runtime `DesktopShell` |
| **Janelas arrastáveis**: titlebar gradiente rosa ativa/cinza inativa, scanline na barra, min/max/close funcionais, z-order, sync com taskbar | lp ~L789-945 | JS ~120 linhas, pointer events | L | **`WindowManager`** — core do romantic OS |
| Menubar fake (Arquivo/Editar/… com underlines) | lp | CSS | S | chrome |
| Ticker/marquee dentro de field sunken | lp | keyframes translateX | S | `Marquee` primitivo |
| Notepad `.notes` (VT323 pre-wrap) | lp | CSS | S | `text` variant |
| Explorer `momentos/` (address bar `C:\…`, grid de ícones 30px) | lp | CSS | S | `gallery`/`freezone` |
| Wizard/dialog (ícone + msg + botões + **progresso segmentado**) | lp | CSS+JS | M | `timer`+`envelope`? → meter |
| **Progress bar win9x segmentada** (`repeating-linear-gradient` blocks, `steps(3)`) | lp | CSS+JS | S | token `Meter` |
| **Start menu** (faixa vertical gradiente + itens) | lp ~L860 | CSS+JS | M | `DesktopShell` |
| **Taskbar** (start, task buttons dinâmicos, tray envelope piscando, relógio real 15s) | lp ~L830 | JS+CSS | M | `DesktopShell` + `LiveClock` |
| Dialogs gag (`data-sys-*` → modal: Responder→erro, Excluir→"não se apaga") | ambos | JS genérico | S | `GagDialog` — mecanismo divertido e barato |
| Icon set (heart, envelope, pc, folder, doc, bin, speaker, error, question, reply…) | ambos | SVG `<symbol>` | S | lib de ícones do sistema |
| **Toast "Você recebeu 1 nova mensagem"** + envelope piscando (auto .9s) | card ~L560 | CSS+JS | S | reveal stage 1 / toast |
| **Mail client**: headers De:/Para:/Assunto: sunken, toolbar gag, letter `<pre>` **typewriter** com cursor, click-to-complete, status "não lida→lida às HH:MM", OK minimiza | card ~L520-560 | JS ~80 linhas | M | letter reveal — `envelope`+`text` ou `hiddenNotes` |
| Hint "psst — tem notificação nova" (aparece 2.6s) | card ~L540 | CSS+JS | S | attention cue |
| Task button flashing até ler | card | `steps(2)` blink | S | attention cue |
| Cursor seta custom data-URI | lp | CSS `cursor:url()` | S | token `cursor` |
| Colapso mobile (janelas → fluxo empilhado) | lp/card | media query | S | já resolvido — replicar |

**Observações**: é o preview que **é** a linguagem decidida. Bevel win9x de 4 camadas
(inset box-shadows), chrome `#c8c4bd`, rosa-vinho como cor de "titlebar ativa". O esforço
L do window manager se paga: reutilizado na LP, no editor e em futuras cartas.

---

## 3. frutiger-aero — "data especial glossy"

| Elemento / interação | Origem | Técnica | Esforço | Destino |
|---|---|---|---|---|
| Sky layers (auroras radiais animadas, sol, lens flares, clouds drift) | lp | CSS gradientes + keyframes | M | background de tema |
| Meadow mist + dew dots | lp | radial gradients | S | idem |
| **Bubbles procedurais** (N elementos, specular + conic iridescente, rise com `--drift`) | lp | JS spawn + CSS | M | `Ambience` primitivo (opcional) |
| Dew droplets em painéis (`data-dew` → N gotas) | lp | JS+CSS | S | decor prop |
| **Glass panel** (`backdrop-filter` blur+saturate, specular ::before, r=28) | ambos | CSS | M | token `glass` (já existe `.glass` no app) |
| **Glossy aero button** (gradient rosa + gloss cap) | ambos | CSS | S | variante de botão |
| Orb icon buttons (radial glass) | lp | CSS | S | ícone container |
| Floating preview card (rotate+bob, skeleton lines) | lp | CSS | S | LP |
| Taskbar glass pill (nav) | lp | CSS | S | nav |
| **Rise-in on scroll** (IntersectionObserver) | ambos | JS ~10 linhas | S | `useScrollReveal` compartilhado |
| Envelope seal orb | card | CSS | S | `envelope` skin |
| **Contador 365 com count-up eased** (IO trigger, rAF cubic) | card ~L430 | JS ~20 linhas | S | **`togetherCounter`** ✓ direto |
| Mini stats row (12 meses, 8.760h, 1 playlist, 999+ memes) | card | CSS | S | `togetherCounter`/stats |
| **Polaroids ×3** (tape, foto SVG, caption Caveat, hover endireita) | card | CSS+SVG | M | `polaroid` (já existe) / `photoBook` |
| Butterfly erratic flight | card | keyframes | S | decor |
| Heart bubbles | card | CSS+JS | S | decor |
| Footbar glass (feito com, CTA ghost, **relógio real**) | card | CSS+JS | S | `LiveClock` + chrome |
| Assinatura Caveat rotacionada | card | CSS | S | `text` signature font |

**Observações**: mais distante da identidade pixel/retro (Nunito/Varela, vidro, sem bevel
duro). Doa `togetherCounter`, polaroids e o padrão count-up; o restante é skin alternativa
cara (backdrop-filter, auroras) para pouco ganho sistêmico.

---

## 4. pixel-rpg — "pedido de namoro jogável"

| Elemento / interação | Origem | Técnica | Esforço | Destino |
|---|---|---|---|---|
| **Sprite engine** (`rows[]` + `pal` → SVG rects, escala px) | lp/card | JS ~12 linhas | S | **`PixelSprite`** (converge c/ orkut painter) |
| Biblioteca de sprites ASCII (heart, sun, cloud, env, doc, potion, photo, clock, brush, frame, portal, shield, coin, Théo, Mel, Carteiro, star, flower, exclaim, sweat…) | ambos | data | S | assets de tema |
| **`panel8`** — borda 4px ink + anel cream + linha ink interna + sombra dura 7px | ambos | CSS | S | **token frame assinatura** |
| Title screen (HUD hearts "1 PLAYER", logo Press Start 2P, "PRESSIONE START" blink, menu com cursor ▶, grass + actors bob) | lp | CSS+JS | M | `envelope`/boot stage |
| **NPC dialog box** (nameplate + typewriter + ▼) | lp | CSS+JS | M | `DialogBox` runtime |
| Quest log (Q1/Q2/Q3 + recompensa) | lp | CSS | S | `memoryCard`/`text` |
| Inventory grid (slots, sel outline, desc box) | lp | CSS+JS | M | showcase de blocos / `memoryCard` |
| Stat bars (repeating-gradient fill, `steps(12)` on scroll) | lp | CSS+JS | S | `Meter` |
| Chiptune WebAudio (square blips, confirm sfx, heart tick, fanfare) | ambos | JS ~20 linhas | M | `useRetroSfx` |
| **Console bezel** ("CORREIO-BOY", LED, speaker slots) | card | CSS | M | device shell |
| **HUD hearts ×5** (3 camadas off/on/gold, pop `steps(3)`, fill progressivo, gold finale) | card ~L384-460 | JS+CSS | M | `intimacyGate`/`Meter` + celebração |
| Quest panel + quest-strip mobile (objetivos com ✓) | card | CSS+JS | S | `memoryCard` |
| Overworld (sun bob, clouds, floating hearts, grass, actors hop/walk, exclaim/sweat bubbles) | card | CSS+sprites | M | scene chrome |
| **Dialog state machine** (`SCRIPT[]` {who,t}, typewriter c/ pausa por pontuação, click-skip, nameplate swap) | card ~L500-640 | JS ~80 linhas | M | **`ScriptPlayer`** runtime |
| **YES/YES menu** | card | JS+CSS | S | `quiz` (yesButton + `isPlayfulNo` já existem!) |
| End choices (Jogar de novo / Criar quest) | card | JS | S | `quiz`/CTA |
| **Celebração**: flash, gold hearts, confetti pixel-hearts ×30, risers, "QUEST COMPLETA!" stamp, fanfare | card ~L640-737 | JS+CSS | M | **`Celebration`** runtime |
| Sound toggle | card | JS | S | chrome |
| CRT scanline overlay (.022 multiply) | card | CSS | S | token `scanline` |
| Teclado (setas/Enter/Espaço) | card | JS | S | a11y runtime |

**Observações**: a experiência mais "completa" (state machine + escolha + celebração), mas
a mais dependente de arte por casal. `quiz` cobre o YES/YES quase de graça.

---

## 5. flip-phone-sms — "convite em telinha 2004"

| Elemento / interação | Origem | Técnica | Esforço | Destino |
|---|---|---|---|---|
| **Aparelho completo** (carcaça perolada, speaker, bezel, LCD verde c/ trama de pixel + reflexo, softkeys, navi-ring 5-way, T9 12×, call/end, mic, "CE-2004", botões volume) | lp ~L877-989, card ~L700-960 | CSS puro ~250 linhas | L | device shell — mas tudo determinístico |
| Status bar LCD (sinal, CORREIO, **relógio real**, bateria) | ambos | CSS+SVG+JS | S | `LiveClock` |
| **Demo loop na LP** (typing → msgs in ×3 → menu → msg out → endcard beat; reinicia) | lp ~L900-989 | JS ~60 linhas | M | `ScriptPlayer` |
| Marquee strip (borda dupla vinho, track duplicado) | lp | CSS+1 linha JS | S | `Marquee` |
| Specimen tray (LCD invertido, teclas grandes, navi big) | lp | reuse | S | LP |
| Beep WebAudio por tecla | lp/card | JS ~10 linhas | S | `useRetroSfx` |
| **Boot/splash** (logo envelope + "iniciando…") | card | JS | S | reveal stage |
| **Notify** ("1 mensagem nova · de: léo", "aperte LER") | card | JS | S | `envelope`/notify stage |
| Standby (clock grande + data + marca) | card | JS | S | estado idle |
| **Thread SMS state machine** (t-head invertido, day sep, typing ∝ tamanho da msg, in/out c/ hora, skip on tap/key) | card ~L974-1064 | JS ~100 linhas | L | **`ScriptPlayer`** — melhor referência |
| **Menu Nokia de respostas** (SIM/CLARO/OUTRO DIA, selecionado invert, navi ↑↓) | card | JS+CSS | M | `ChoiceMenu` → **`ticketRsvp`** perfeito |
| **Compose T9** (textarea LCD + contador /160 + Enter envia + Apagar=backspace) | card | JS | M | `ticketRsvp`/`freezone` |
| Send flow (enviando…→entregue ✓ + resposta 2 fases) | card | JS | M | `ScriptPlayer` |
| Endcard (overlay, heart beat, hints) | card | CSS+JS | S | `Celebration` leve |
| Softkeys contextuais (rótulos por estado) | card | JS | M | softkey runtime |
| Teclado físico (setas/Enter/Espaço) | card | JS | S | a11y |
| **Mobile: aparelho vira fullscreen** (radius 0, 100dvw/vh) | card | media query | S | já resolvido — mobile-first real |

**Observações**: o card é uma experiência única e autocontida — boot→notify→thread→menu→
compose→end. `ticketRsvp` nasce desse menu. É o preview mais "produto" (pouco chrome a
inventar, muito comportamento a formalizar).

---

## 6. early-web — "anônimo em fan page GeoCities"

| Elemento / interação | Origem | Técnica | Esforço | Destino |
|---|---|---|---|---|
| Window chrome (winbar gradiente + 3 btns bevel + menubar) | ambos | CSS | S | chrome compartilhado c/ retro-os |
| Tiled bg (star/heart SVG data-URI 64-72px) | ambos | CSS | S | token `tile` de tema |
| **Marquee** (track duplicado, pause on hover) | ambos | CSS+JS | S | `Marquee` |
| Sidebar "» links" dotted | ambos | CSS | S | nav de tema |
| **Contador visitante 7 dígitos** (digit wells escuros + glow, localStorage) | lp ~L425-430, script L560-574 | JS+CSS | S | `togetherCounter` variante / gimmick |
| Contador travado "0000001" ("só existe pra uma pessoa") | card L440 | markup | S | idem |
| Selo de qualidade (rosette + coração + ribbon SVG) | lp L438 | SVG | S | decor asset |
| Status box ("humor do site: apaixonado") | lp | CSS | S | `text` fineprint |
| Dividers: rainbow, hearts, embossed rule | ambos | CSS/data-URI | S | tokens divider |
| Guestbook entries (head gradient + Comic Sans body) | ambos | CSS | S | `text` / guestbook |
| **Guestbook funcional local** (nome+msg → prepend + scrollIntoView) | card ~L620-647 | JS ~25 linhas | M | **guestbook** (lacuna — precisa persistência) |
| Letter em moldura guestbook ("mensagem selada", paper lined Georgia, sig VT323) | card L471-489 | CSS | S | `text`/`envelope` skin |
| **Clue cards ×3** (pista nº, sunken, itálico) | card L497-510 | CSS | S | **`hints`** ✓ direto |
| **Suspects ×3** (silhueta pixel, click → 5 respostas evasivas ciclando + shake) | card L518-541, script L602-618 | JS+CSS | S | `quiz`/investigation (evasive-answer pattern) |
| "agora tocando" + **equalizador 5 barras** | card L447-452 | CSS | S | `music` skin |
| Under construction strip (hazard stripes animados) | ambos | CSS | S | divider/gag |
| **Webring footer** (« anterior · aleatória · próxima ») | ambos | markup | S | nav footer de tema |
| Heart cursor data-URI | ambos | CSS | S | token `cursor` |
| Statusbar/addrbar fake browser | ambos | CSS | S | chrome |
| "última atualização: hoje" (data real) | lp | JS 2 linhas | S | `LiveClock` data |
| Ctrl+D gag (alert "aperta ctrl+d") | lp | JS 4 linhas | S | gag |

**Observações**: o mais barato de portar (quase só CSS) e com 2 mapeamentos diretos
(`hints`, `music` skin). O guestbook é a única dependência de backend real entre todos.

---

## 7. Tokens convergentes → fundação do "romantic OS"

### Tipografia
| Papel | Fonte | Onde |
|---|---|---|
| Chrome/micro-labels | **Silkscreen** | 5/6 previews (não-aero) |
| Corpo pixel/terminal | **VT323** | orkut, retro, pixel-rpg, early-web |
| Display | Press Start 2P (só RPG), DotGothic16 (só flip) | específicas |
| Corpo legível | Verdana/Tahoma/Segoe | orkut, retro, early-web |
| Carta/serif | Georgia | early-web letter |
| Assinatura | Caveat | aero |

→ **Pilha canônica**: Silkscreen (chrome) + VT323 (corpo pixel) + Verdana (corpo legível) + Georgia (carta) + Caveat (assinatura).

### Forma/efeito
| Token | Receita dominante | Onde |
|---|---|---|
| `--bevel-win9x` | 4 camadas inset box-shadow (hi/mid/lo/dk) | retro-os, early-web (border trick), orkut (gradient) |
| `--frame-panel8` | 4px ink + anel cream + linha ink + sombra 7px | pixel-rpg |
| `--shadow-hard` | offset sólido sem blur (4-7px) | retro-os, pixel-rpg, flip, index |
| `--scanline` | overlay repeating 1px (.022-.028) | retro-os, pixel-rpg, flip LCD (2 eixos) |
| `--ease-step` | `steps()` em tudo | pixel-rpg total, flip, retro, early |
| `blink` | opacity 0/1 `steps(1-2)` ~1-1.3s | 5/6 |
| `--heart-7x6` | glyph SVG canônico | retro, early, flip |
| `--heart-9x8` | variante mais cheia | orkut |
| Cursor | data-URI seta / coração | retro, early |
| Cor de marca | `#e11d48`/`#be123c`/`#f43f5e` + ink `#4c0519`/`#701a35`/`#881337` | aero, flip, early, retro (acento), index |
| `--paper`/`--cream` | `#fff5f7`/`#fffdf8`/`#ffe4ec`/`#fecdd3`/`#fda4af` | todos |
| Live clock | relógio real na chrome | retro, aero, flip |
| Tiled bg | data-URI 64-72px repetido | early-web |
| Divider corações | repeat-x 26×14 | early-web, orkut |
| `prefers-reduced-motion` | respeitado em todos | obrigatório no runtime |

**Fora do sistema**: lilás Orkut (tema), LCD verde (tema), glass/aurora aero (skin), ink+cream RPG (tema — mas `panel8` é candidato a frame global).

### Pixel art como dado — duas implementações convergentes
- orkut: `data-art`/`data-pal` → path por cor (1 path/cor)
- pixel-rpg: `rows[]` + `pal` → rects

→ Um único `<PixelSprite rows pal cell>` resolve os dois; sprite lib vira asset de tema.

---

## 8. Mapeamento componente → bloco do editor

**Existentes**: `text`, `image`, `timer`, `gallery`, `music`, `video`, `envelope`, `scratch`, `timeline`, `quiz`, `polaroid` (confirmado em `frontend/src/editor/types.ts` L9-20).
**Planejados**: `bouquet`, `photoBook`, `ticketRsvp`, `hints`, `freezone`, `intimacyGate`, `memoryCard`, `hiddenNotes`, `togetherCounter`.

| Componente do preview | Bloco | Confiança |
|---|---|---|
| Depoimento/carta/email/letter lined | `text` (categories já existem) | ✅ direto |
| Pixel avatares/sprites | decor de bloco ou `freezone` + `PixelSprite` | ✅ |
| Polaroids | `polaroid` → `photoBook` qdo >3 | ✅ |
| "agora tocando" + equalizador | `music` (skin LCD) | ✅ |
| Contador 365 / stats | `togetherCounter` | ✅ |
| Contador visitante | `togetherCounter` variante ou gag | ⚠️ meio |
| Relógio real | prop de shell, não bloco | ✅ |
| Pistas (clue cards) | `hints` | ✅ |
| Suspects evasivos | `quiz` variante / `hiddenNotes` | ⚠️ meio |
| YES/YES, menu Nokia, end choices | `quiz` (já tem `isPlayfulNo`) | ✅ |
| **Menu SIM/CLARO/OUTRO DIA + compose T9** | **`ticketRsvp`** — é literalmente RSVP | ✅✅ |
| Envelope seal, boot→notify→open | `envelope` + reveal stages | ✅ |
| Mensagem selada/pistas espalhadas | `hiddenNotes` | ✅ |
| Quest log/objetivos/memórias | `memoryCard` | ✅ |
| Gate antes de abrir carta | `intimacyGate` | ✅ |
| Heart-HP meter, karma bars, stat bars | `memoryCard`? → **lacuna: `meter`** | ⚠️ |
| **Scripted chat/SMS/dialog playback** | **lacuna: `chatScript`/`scriptPlayer`** | ⚠️ principal |
| **Guestbook com submissão** | `freezone`? → **lacuna de backend** | ⚠️ |
| "amei" reaction counter | lacuna pequena (prop de `text`?) | ⚠️ |
| Marquee/ticker | prop de `text`/divider | ✅ |
| Dividers (hearts, rainbow, embossed) | divider de tema | ✅ |
| Desktop icons/windows/taskbar | **shell de template, não bloco** | — |
| Phone bezel, console bezel | **shell de template** | — |
| Toasts/notificações | chrome de shell | — |
| Typewriter | prop `effect` de `text`/`DialogBox` | ✅ |
| Nudge/shake | prop `cue` em botão/janela | ✅ |
| Confetti/fanfare/gold hearts | efeito de `Celebration` no `quiz`/`ticketRsvp` success | ✅ |
| `bouquet`, `video`, `scratch`, `timeline`, `gallery` | sem equivalente direto nos previews | (já planejados) |

**Insight estrutural**: os previews misturam 3 camadas —
1. **Shell/chrome** (desktop, aparelho, console, browser frame) → vira *template/tema*;
2. **Blocos** (letter, polaroid, menu, pistas) → vira *block do editor*;
3. **Runtime** (typewriter, state machine, sfx, reveal) → vira *hooks/primitivos* compartilhados.
A separação já é visível nos próprios arquivos (chrome ≈ CSS, runtime ≈ <150 linhas JS).

---

## 9. Primitivos de interação reutilizáveis (runtime compartilhado)

| Primitivo | Fonte(s) | Complexidade |
|---|---|---|
| `PixelSprite` (rows+pal→SVG, palette swap, crispEdges) | orkut + pixel-rpg | S |
| `useTypewriter` (cadência por pontuação, cursor block, click-to-complete) | retro letter, RPG dialog | S |
| `ScriptPlayer` (steps: msg-in/typing/pause/choice/fx/end; skip on tap/key) | flip thread + RPG SCRIPT + lp demos | M |
| `ChoiceMenu` (lista invert/▶, navi ↑↓, YES/YES, ramifica) | flip menu, RPG choices, suspects | S |
| `Meter` (segmented bar / heart-HP / karma; fill `steps()`; gold state) | 4 previews | S |
| `Celebration` (flash + confetti pixel-hearts + stamp + fanfare + risers) | pixel-rpg (referência) | M |
| `AttentionCue` (blink/softblink, nudge shake, toast pulse, "psst" hint) | todos | S |
| `LiveClock` (HH:MM real na chrome) | retro, aero, flip | S |
| `CountUp` (IO trigger, rAF eased) | aero 365 | S |
| `useRetroSfx` (WebAudio square blips/fanfare/beep; respeita gesture+toggle) | pixel-rpg, flip | S-M |
| `useScrollReveal` (IntersectionObserver rise-in) | aero, pixel-rpg | S |
| `Toast`/`Notify` (auto-in, blink, dismiss, click-to-open) | orkut, retro, flip | S |
| `WindowManager` (drag pointer, z-order, min/max/close, taskbar sync, mobile collapse) | retro-os | L — único L real |
| `Softkeys`/`NaviRing` (rótulos contextuais por estado) | flip | M |
| `useLocalState` (localStorage counter/guestbook) | early-web | S |
| `Marquee` (track duplicado, pause on hover) | early, flip, retro | S |

---

## 10. Ranking — proximidade de virar template de produção

| # | Preview | Por quê |
|---|---|---|
| **1** | **retro-os** | É literalmente a linguagem decidida (chrome retro + rosa-vinho). O `WindowManager` é o único L e se paga 3× (LP, carta, editor). Carta = reveal mais elegante e barato (toast→typewriter). Bevel/tokens já canonizáveis. |
| **2** | **flip-phone-sms** | Card mais "produto": experiência única autocontida, mobile-native (device vira a tela), `ScriptPlayer`+`ticketRsvp`+`ChoiceMenu` nascem direto dele. Custo: shell CSS grande, mas zero asset externo. |
| **3** | **pixel-rpg** | Experiência mais completa (máquina de estado + escolha + celebração), mapeamento limpo para `quiz`/`intimacyGate`. Pesa contra: arte sprite por casal e afastamento do uso geral — ideal como template premium de "pedido". |
| **4** | **orkut-msn** | Depoimento = fit BR perfeito; ótimos doadores (toast, nudge, reaction, karma). Chrome Orkut (lilás) fora da paleta — melhor como fonte de blocos/padrões do que como template 1:1. |
| **5** | **early-web** | Mais barato de portar (quase só CSS) e doa `hints`, guestbook, dividers, cursor. Metáfora mobile fraca e apelo "novelty" — bom segundo template ou pack de decorações. |
| **6** | **frutiger-aero** | Mais bonito visualmente, mas é a anti-identidade do romantic OS (vidro/suave vs bevel/pixel). Doa `togetherCounter`+`CountUp`+polaroids; manter como candidato de skin futura, não como base. |

**Recomendação de ordem de trabalho**: extrair primeiro os primitivos baratos de retro-os + early-web (tokens, `PixelSprite`, `Meter`, `AttentionCue`, `Marquee`), depois os runtimes médios (`Typewriter`, `ScriptPlayer`, `ChoiceMenu`, `Celebration`, `RetroSfx`) com pixel-rpg/flip como referência, e por último o `WindowManager` (retro-os) e o shell do aparelho (flip) como os dois "shells" de template inaugurais.
