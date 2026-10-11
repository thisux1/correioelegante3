# flip-phone-sms — design preview

Estilo: **feature phone 2004** — candybar prata-rosada, telinha LCD monocromática, teclado T9, navi-ring, barra de status com sinal/bateria/hora real. Momento: **convite/date** — Léo chama Nina pra açaí + pracinha, tudo por SMS.

## Arquivos

| arquivo | o que é |
| --- | --- |
| `lp.html` | Landing page — hero com o aparelho rodando demo em loop, marquee, 3 passos, bandeja de peças (specimen), CTA. |
| `card.html` | A página gerada — thread SMS interativa do Léo, typing indicator, menu Nokia (SIM / CLARO / OUTRO DIA), compose T9, endcard. |

## Paleta

### Marca (fora do aparelho)
| token | hex | uso |
| --- | --- | --- |
| `--blush-050` | `#fff5f7` | fundo da página |
| `--blush-100` | `#ffe4ec` | painéis, marquee |
| `--blush-200` | `#fecdd3` | sombras sólidas (hard shadows) |
| `--rose-600` | `#e11d48` | CTA, ícones pixel |
| `--wine-900` | `#4c0519` | texto, bordas 2px, hard shadow |
| `--wine-700` | `#701a35` | texto secundário |

### Aparelho
| token | hex | uso |
| --- | --- | --- |
| `--body-hi / --body / --body-lo` | `#fdf2f6 → #eed6e1 → #d9b7c8` | carcaça perolada |
| `--bezel` | `#3a1420` | moldura da tela |
| `--lcd` | `#dcead3` | telinha verde-clara |
| `--lcd-lo` | `#c6dab9` | LCD, borda inferior |
| `--lcd-ink` | `#213320` | "tinta" da LCD (texto, msg enviada invertida) |
| `--lcd-hi` | `#edf6e6` | texto sobre `--lcd-ink` |
| `--key-*` | `#fff / #e9dce3 / #c5a8b8` | teclas |
| `--call-tx / --end-tx` | `#1c6b3f / #a21a3f` | glifos chamar/encerrar |

## Fontes (Google Fonts, todas com ç/ã/õ)

- **VT323** — texto da LCD e corpo da LP (19–22px+; legível só acima de ~16px).
- **Silkscreen** — micro-labels 6–9px: status bar, softkey labels, letras do T9, metas.
- **DotGothic16** — display: H1/H2, logo, botões.

## Design tokens extraíveis

1. **`--lcd-ink` on `--lcd`** — o par monocromático; texto "invertido" (vídeo reverso Nokia) = `--lcd-hi` sobre `--lcd-ink`, usado em msg enviada, item de menu selecionado, header do thread.
2. **Hard shadow 2px-border** — `border:2px solid var(--wine-900); box-shadow:6px 6px 0 var(--blush-200)` em cards/botões (sombra em `steps()`, sem blur).
3. **Pixel-icon grid** — SVG com `viewBox` 1px/célula e `<rect>`s (envelope 11×8, coração 7×6, sinal 16×12, bateria 18×10, check 7×6, handset 8×8). `fill:currentColor`.
4. **LCD texture** — overlay `repeating-linear-gradient` 1px/3px nos dois eixos (trama de pixel) + reflexo diagonal de vidro + `inset` shadows de bezel.
5. **Animação "digital pop"** — `steps(2–3)` em vez de easing suave (msg `pop`, `softblink` das hints, `beat` do coração, `tdot` do typing).

## Interações (card.html)

- Thread avança sozinha; **toque na tela / qualquer tecla** pula "digitando…".
- **Softkeys funcionais** com rótulos na tela que mudam por estado (Ler/Sair, Selec./Voltar, Enviar/Apagar, Rever/Fim).
- **Navi-ring**: cima/baixo navega o menu; centro confirma; esq/dir avança.
- **OUTRO DIA** abre compose com textarea LCD (contador /160, Enter envia, softkey Apagar = backspace).
- Setas do teclado físico, Enter e Espaço também operam tudo.
- Bip Nokia via WebAudio após primeiro gesto; telas de standby/boot completam a ilusão.
