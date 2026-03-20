# Guia de Identidade Visual

Este documento consolida a identidade visual atual do Correio Elegante com base no frontend em producao.
Use estas regras como referencia obrigatoria para manter consistencia entre paginas, componentes e novas features.

## 1) Direcao visual

- Estetica principal: romantica, leve e acolhedora (rosa + branco + brilho suave).
- Linguagem visual: glassmorphism, gradientes delicados, cards arredondados, coracoes e elementos afetivos.
- Tom de interface: emocional, amigavel e elegante (sem visual corporativo duro).

## 2) Tokens oficiais

Fonte principal de tokens: `frontend/src/index.css`.

### 2.1 Cores base

| Token | Valor | Uso principal |
| --- | --- | --- |
| `--color-primary` | `#e11d48` | CTA principal, destaques, icones de acao |
| `--color-primary-light` | `#fb7185` | Hover/variante suave do primario |
| `--color-primary-dark` | `#be123c` | Hover de botoes primarios |
| `--color-secondary` | `#f43f5e` | Gradientes e reforco de destaque |
| `--color-accent` | `#fda4af` | Acabamentos e elementos sutis |
| `--color-background` | `#fdf2f8` | Fundo global do site |
| `--color-surface` | `#ffffff` | Superficies solidas |
| `--color-surface-glass` | `rgba(255, 255, 255, 0.6)` | Cartoes/paineis glass |
| `--color-text` | `#1f2937` | Texto principal |
| `--color-text-light` | `#6b7280` | Texto secundario |
| `--color-text-muted` | `#9ca3af` | Metadados e apoio |
| `--color-border` | `rgba(255, 255, 255, 0.4)` | Bordas em glass |
| `--color-gold` | `#d4a574` | Destaque premium pontual |
| `--color-gold-light` | `#e8c9a0` | Destaque premium secundario |

### 2.2 Cores de estado

- `success`: emerald (`bg-emerald-100`, `text-emerald-600/700`)
- `warning`: amber (`bg-amber-100`, `text-amber-700`)
- `error`: red (`bg-red-50/100`, `text-red-500/600`, `border-red-200`)
- `info` contextual (pagamento cartao): blue (`bg-blue-50`, `border-blue-400`, `text-blue-600`)

Regra: manter semantica por estado; nao reutilizar vermelho/verde como cor decorativa.

### 2.3 Tipografia

| Token | Familia | Papel |
| --- | --- | --- |
| `--font-sans` | Inter | UI geral, leitura, formularios |
| `--font-display` | Playfair Display | Titulos e headlines |
| `--font-cursive` | Dancing Script | Mensagens afetivas e conteudo de carta |

Regra: cada tela deve combinar no maximo essas 3 familias. Nao introduzir quarta familia sem necessidade forte.

### 2.4 Curva de animacao

- Curva canonica: `--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1)`.
- Use essa curva para entrada/saida de elementos principais.

## 3) Hierarquia tipografica explicita

### 3.1 Titulos

- Hero principal: `font-display`, `text-5xl md:text-7xl`, `font-bold`, `text-text`.
- Titulo de pagina: `font-display`, `text-4xl md:text-5xl`, `font-bold`, `text-text`.
- Titulo de secao: `font-display`, `text-4xl md:text-5xl`, `font-bold`.
- Titulo de card/bloco: `font-display`, `text-xl` ate `text-2xl`, `font-bold`.

### 3.2 Corpo e apoio

- Texto de apoio principal: `text-lg` ou `text-xl`, `text-text-light`, `leading-relaxed`.
- Texto padrao de UI: `text-sm` a `text-base`, `text-text` ou `text-text-light`.
- Metadados: `text-xs`, `text-text-muted`.
- Texto de carta/preview emocional: `font-cursive`, `text-lg` a `text-xl`, `leading-relaxed`.

### 3.3 Destaque textual

- Use `.text-gradient` para destacar 1 a 3 palavras por titulo.
- Evite aplicar gradiente no titulo inteiro para nao reduzir legibilidade.

## 4) Layout, espacamento e composicao

### 4.1 Containers e ritmo vertical

- Paginas internas: base `min-h-screen pt-28 pb-16 px-6`.
- Secoes long-form: `py-32 md:py-48` via `ScrollSection`.
- Larguras de conteudo:
  - Conteudo denso: `max-w-3xl` / `max-w-4xl`
  - Landing e secoes principais: `max-w-6xl` / `max-w-7xl`

### 4.2 Grid e gaps

- Gaps padrao: `gap-4`, `gap-6`, `gap-8`.
- Gaps de destaque (secoes hero/marketing): `gap-12` ate `gap-16`.

### 4.3 Radius e formas

- `rounded-lg`: controles compactos.
- `rounded-xl`: inputs e botoes padrao.
- `rounded-2xl`: cards/paineis principais.
- `rounded-3xl`: blocos de alto destaque (footer, CTA de fechamento).
- `rounded-full`: badges, avatares, indicadores circulares.

## 5) Superficies e profundidade

### 5.1 Glassmorphism (classe canonica)

Classe `.glass` (usar sem reimplementar):

- `backdrop-filter: blur(16px)`
- `background: var(--color-surface-glass)`
- `border: 1px solid var(--color-border)`
- `box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08)`

Regra: use glass em containers flutuantes, modais, cabecalho e cards premium.

### 5.2 Sombras

- Base: `shadow-lg shadow-black/5`.
- CTA primario: `shadow-lg shadow-primary/25`.
- Destaque forte: `shadow-2xl`.

Nao exagerar sombra em elementos pequenos.

## 6) Componentes canonicamente aceitos

Referencias: `frontend/src/components/ui/*.tsx`.

### 6.1 Botao (`Button`)

- Variantes: `primary`, `secondary`, `ghost`, `outline`.
- Microinteracao obrigatoria: hover `scale: 1.02`, tap `scale: 0.98`.
- CTA principal sempre em `primary`.
- Acoes destrutivas devem ser explicitamente vermelhas (nao usar `primary`).

### 6.2 Card (`Card`)

- Padrao: `rounded-2xl p-6`.
- Tipos:
  - Solido branco (conteudo comum)
  - Glass (`glass={true}`) para efeito premium
- `hover` opcional para cards interativos (leve elevacao).

### 6.3 Formulario (`Input`, `TextArea`)

- Fundo transluscido (`bg-white/80`) com blur leve.
- Focus consistente: `focus:ring-2 focus:ring-primary/30` + `focus:border-primary/50`.
- Erro: borda vermelha + mensagem curta em `text-xs text-red-500`.

### 6.4 Badge (`Badge`)

- Uso: status curto (pago, pendente, erro, sucesso).
- Tamanho: pequeno (`text-xs`), formato pill.

### 6.5 Modal (`Modal`)

- Backdrop escuro transluscido com blur (`bg-black/40 backdrop-blur-sm`).
- Conteudo em glass com entrada spring (escala + deslocamento vertical).

## 7) Sistema de animacao

### 7.1 Biblioteca e stack

- Principal: Framer Motion.
- Scroll suave global: Lenis (`ReactLenis` em `SmoothScroll`).
- Atmosfera pesada (estrelas/bokeh): Canvas com scheduler compartilhado.

### 7.2 Regras de entrada e reveal

- Entradas iniciais de pagina: opacidade + deslocamento vertical leve.
- `ScrollReveal` e `SectionReveal` sao os componentes padrao para animacao por scroll.
- Padrao de timing para blocos: `duration` curta/media (0.3s a 0.8s) com ease expo.

### 7.3 Microinteracoes

- Botoes: scale sutil (ja padronizado em `Button`).
- Cards especiais: tilt 3D (`CardTilt3D`) apenas onde agrega percepcao premium.
- Botoes magneticos (`MagneticButton`): usar em CTAs principais, nao em toda a UI.

### 7.4 Hero e narrativa animada

- Hero usa timeline cinematica por scroll (aviao -> envelope -> coracao).
- Regra: nao misturar muitas novas animacoes no hero sem preservar essa historia visual.

### 7.5 Performance

- Para efeitos globais, preferir Canvas com loop compartilhado (`scheduleRenderer`).
- Em mobile, reduzir contagem de particulas e custo de blur.
- Evitar novas animacoes infinitas fora da atmosfera/hero.

## 8) Fundo, atmosfera e camadas

- Fundo base: gradiente vertical suave com noise (`BackgroundField`).
- Atmosfera global: nuvens + estrelas em camadas fixas (`SiteAtmosphere`).
- Header fixo com glass e borda progressiva por scroll.

Regra de z-index funcional:

- Background profundo: valores negativos
- Conteudo comum: fluxo normal
- Header/menu: camada alta (`z-40`)
- Modal e overlays: acima de header (`z-40` / `z-50`)
- Cursor customizado: topo absoluto (`z-[9998]` e `z-[9999]`)

## 9) Interacao de cursor (desktop)

Cursor customizado com pena e trilha de tinta esta ativo apenas em desktop.

Atributos utilitarios:

- `data-no-ink="true"`: desativa trilha em areas sensiveis (ex.: textos densos).
- `data-cursor-light="true"`: inverte cursor em fundo escuro/forte.
- `data-magnetic-target="true"`: habilita atracao magnetica (gerenciado por `MagneticButton`).

Regra: nao usar esses atributos sem necessidade real.

## 10) Responsividade

- Estrategia mobile-first com breakpoints `md` e `lg`.
- Navegacao:
  - Desktop: menu horizontal no header
  - Mobile: menu colapsado em painel glass
- Animacoes devem degradar com elegancia em mobile (menos particulas e menor complexidade).

## 11) Padrao de linguagem visual por contexto

- Landing/Home: mais emocional, cinematica e rica em movimento.
- Fluxos de acao (Auth/Create/Payment/Profile): visual limpo, foco em clareza e conversao.
- Erros: manter tom humano, mas sem quebrar paleta base.
- Pagamento:
  - Pix: codigo visual verde
  - Cartao: codigo visual azul
  - Mantendo estrutura geral do design system.

## 12) Regras de consistencia (obrigatorias)

- Sempre reutilizar tokens e componentes existentes antes de criar novos estilos.
- Sempre manter `font-display` em titulos e `font-sans` na UI geral.
- Sempre usar `text-text`, `text-text-light` e `text-text-muted` por hierarquia.
- Sempre usar `primary` para CTA principal.
- Nunca hardcodar paleta nova para componentes base sem aprovar novo token.
- Nunca aplicar animacao chamativa em toda tela; use destaque em pontos de decisao.

## 13) Checklist rapido para PR visual

- Hierarquia tipografica esta clara (titulo, apoio, metadata)?
- CTA principal esta evidente e com variante correta?
- Cores estao dentro dos tokens oficiais?
- Animacoes estao suaves, curtas e coerentes com o contexto?
- Mobile permanece legivel e funcional?
- Componente novo respeita raio, sombra, spacing e linguagem glass do projeto?

## Fontes consultadas

- `frontend/src/index.css`
- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Card.tsx`
- `frontend/src/components/ui/Input.tsx`
- `frontend/src/components/ui/TextArea.tsx`
- `frontend/src/components/ui/Badge.tsx`
- `frontend/src/components/ui/Modal.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/Footer.tsx`
- `frontend/src/components/layout/ScrollSection.tsx`
- `frontend/src/components/animations/ScrollReveal.tsx`
- `frontend/src/components/animations/SectionReveal.tsx`
- `frontend/src/components/animations/TextSplit.tsx`
- `frontend/src/components/animations/CardTilt3D.tsx`
- `frontend/src/components/animations/MagneticButton.tsx`
- `frontend/src/components/animations/CustomCursor.tsx`
- `frontend/src/components/animations/BackgroundField.tsx`
- `frontend/src/components/animations/SiteAtmosphere.tsx`
- `frontend/src/components/animations/HeroAnimation.tsx`
- `frontend/src/pages/Home.tsx`
- `frontend/src/pages/Create.tsx`
- `frontend/src/pages/Auth.tsx`
- `frontend/src/pages/Profile.tsx`
- `frontend/src/pages/Payment.tsx`
- `frontend/src/pages/Card.tsx`
- `frontend/src/pages/Editor.tsx`
