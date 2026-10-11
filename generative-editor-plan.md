# Plano: Correio Elegante Generativo — LP, Editor e Pipeline de Geração

> Documento de direção de produto/engenharia. Brainstorm 2026-09-28 +
> sessões de alinhamento (perguntas/respostas) nos dias 28-30/09 +
> pesquisa de referência meupresente.app (11/10 — §7.1/7.2/8.0/9.5/13.1).
> Status: **alinhado — documento vivo** (evolui conforme decisões mudam;
> o que virar contrato real migra para `SPEC.md`).
> Decisões estruturais travadas na seção 2; pendências de implementação
> na seção 15. Doc irmão: **`stack-research.md`** (decisões de stack,
> pesquisa verificada 2026-09-28).
> Branch de referência: `feature/awwwards-redesign`

---

## 1. Diagnóstico

### 1.1 Landing page

Estado atual percebido: amadora, mockada, genérica. O problema não é a
estrutura de seções — `OccasionsSection`, `HowItWorksSection`,
`ProductPreviewSection`, `InteractiveEnvelopeDemo`, `ProblemSection`,
`CompareExperienceSection`, `FAQSection`, `FinalCTASection` já cobrem a
narrativa certa. O problema é de **execução de craft** (tipografia, motion,
hierarquia, densidade de detalhe) e de **promessa**: a LP fala *sobre* o
produto em vez de *demonstrar* o produto.

Tese da nova LP: **a landing page é o próprio produto**. Com paywall pós-reveal
(decisão §2), o gerador pode ser público — a LP hospeda o funil real, não uma
encenação dele. A demo pública (§9.3) entra quando o conjunto estiver polido.

### 1.2 Editor

Cold-start ruim: o usuário precisa aprender um sistema do zero antes de ter
qualquer coisa bonita. Resolução: **o editor deixa de ser ferramenta de criação
e vira ferramenta de refinamento** — o onboarding gera um ponto de partida lindo
e populado; editar é melhoria, não obrigação. Quem quiser começar do zero
continua podendo.

Gap assumido: **o editor atual ainda não foi auditado**. O diagnóstico de onde
a UX falha de fato é item da Fatia 0 (§11) — não assumir que "virar
refinamento" resolve sozinho.

### 1.3 Concorrência

Todos os concorrentes são básicos e oferecem menos liberdade que o estado
atual. A diferenciação vem do **teto de craft**: buquê procedural, scratch
reveal, ticket RSVP interativo, photo book, grid editor com resize. É o que
provoca a reação em quem recebe — e quem recebe é o próximo usuário (loop
viral embutido).

### 1.4 Filosofia de execução

- **Não é MVP, é SLC** (Simple, Lovable, Complete): full features, full
  polimento, LLM day 0 — o pipeline triplo entra desde o início (§4).
- **Incremento e validação**: fatias verticais de ponta a ponta, cada uma com
  **métricas de validação definidas** (§11) — "validável" sem métrica não vale.
- Plano geral de produto, não sprint.

---

## 2. Decisões travadas (sessão de alinhamento)

| # | Decisão | Resultado |
|---|---|---|
| D1 | **Regime do editor** | Structured canvas **com posicionamento em grid**: mover/redimensionar blocos num grid com snap, valores limitados. "Constrained freeform" — serializa como `{col,row,w,h}` por bloco dentro da seção. |
| D2 | **Profundidade do LLM** | **Pipeline triplo** construído e comparado por eval (§4). LLM day 0 confirmado. |
| D3 | **Estética** | **DECIDIDO (2026-10-11): pixel art / nostalgia digital 2000s como identidade de marca.** Interfaces retro (OS dialogs, pixel fonts, dithering) como linguagem de sistema. Âncora cultural BR: Orkut/MSN/depoimentos — ancestral digital do correio elegante. Guardrails: pixel p/ chrome/UI/headlines, fonte legível p/ corpo; variação de mood por momento dentro da mesma linguagem; paleta "romantic OS" a definir (§3.6). |
| D4 | **Paywall** | **Depois do reveal**: gera grátis, paga pra publicar. Reveal é o hook; gerador público exige rate limit + expiração de drafts. |
| D5 | **Primeiro momento do slice** | **Crush secreto** — valida o caso de maior volume real. |
| D6 | **RSVP** | **Completo no lançamento**: resposta persiste + notifica remetente. É o item mais caro → backend sobe na fila (§11). |
| D7 | **Demo real** | Demo pública polida na LP **quando tudo estiver pronto** — sem placeholder artesanal. |
| D8 | **Menores/LGPD** | **Assumir + mitigar**: público inclui menores → moderação, DPA com provedor LLM, avisos, report/bloqueio. Vira workstream real (§10.3). |
| D9 | **"JEV" esclarecido** | Classe de **modelos de decisão estruturada** (System One: primitivas `Choice`/`Score` — Jev, CLM, Kev, Laya, NanoJev), não rules engine nem LLM generativo. Engine = regras duras + modelo local pequeno, ver §4.2. |
| D10 | **Provider LLM** | **Google Gemini** (Flash p/ extração, JSON mode). Custos/latência a medir na Fatia 5; DPA a verificar (§10.3). |
| D11 | **Notificação RSVP** | **Todos os canais**: in-app + email + WhatsApp Business API (templates/custo — onboarding cedo). |
| D12 | **Colapso mobile do grid** | **Auto + override**: row-major default; usuário pode reordenar explicitamente no mobile. |
| D13 | **Juiz do eval** | **Só humano** — batches pequenos com rubrica; gargalo aceito pela qualidade do julgamento. |
| D14 | **Freemium** | **Paga pra publicar, tudo incluído** — sem split de blocos premium. |
| D15 | **Viés da pesquisa estética** | **Sem viés** — nostalgia digital testada contra outras direções com público real (§13.1). |

---

## 3. Princípios arquiteturais

### 3.1 Convergência para `PageSpec` → `Block[]`

Todo produtor (engine, LLM, híbrido, edição manual) emite o mesmo
`PageSpec` intermediário → `compilePageSpec(spec) → Block[]`. Página gerada e
página manual são indistinguíveis; editor é refinement para ambas.

**Correção importante (crítica interna):** o `Block[]` atual é **plano**.
Adotar sections + grid (D1) exige evolução do schema: bloco passa a ter
`sectionId` e coordenadas de grid opcionais; páginas existentes migram para
"uma seção stack implícita". Isso é uma **mudança de schema versionada com
migração** — fatia própria (Fatia 3), não detalhe de implementação.

### 3.2 Decisão estruturada local como espinha, LLM como camada — com eval

"JEV" esclarecido (D9): a engine não é rules engine nem LLM generativo — é a
classe de **modelos "System One" de decisão estruturada** (Jev, CLM, Kev,
Laya, NanoJev): modelos pequenos e baratos que respondem primitivas
(`Choice`, `Score`) em vez de gerar texto. Perfeito pro nosso espaço de
decisão finito (templateFamily, módulos, tema). Stack em camadas (§4.2):
regras duras como invariantes sempre, modelo local treinável como scoring,
LLM (Gemini) só pra interpretação de texto livre e copy — com fallback
determinístico quando qualquer camada falha.

### 3.3 LLM propõe, engine valida

Toda saída LLM passa por `PageSpec.parse()` (Zod) + regras de sanidade
(blocos válidos, ordem permitida, tema dentro do espaço, zero emojis, light
theme). Violação → reparo automático ou fallback determinístico. Generative UI
com guardrails.

### 3.4 Copy: banco curado como base, LLM como ferramenta de autoria

Copy ruim romântica é ativamente pior que genérica. Estratégia de volume:
**LLM rascunha os bancos de copy em build-time, humano cura** — resolve o
problema "centenas de textos" sem custo de runtime e sem risco de cringe ao
vivo. Runtime usa o banco; LLM personaliza slots como upgrade.

### 3.5 Stack: sem serviço Python

Node/TS + Zod (equivalente a Pydantic, já usado no repo). Structured output
via provider SDK/AI SDK validado por Zod.

### 3.6 Regras de UI — revisão necessária pós-D3

Com a identidade pixel/nostalgia-2000s decidida (D3), `AGENTS.md` precisa de
atualização formal. Permanecem: light theme, zero emojis, zero badges/pills,
pt-BR. **Pendente de design**: paleta — rose/vinho atual não casa com chrome
retro. Proposta de trabalho: **"romantic OS"** — janelas creme/bege, acentos
rosa-vinho, sprites pixel como ícones (substituem lucide onde couber),
tipografia pixel para display/UI + legível para corpo (verificar cobertura
de acentos pt-BR; candidatas: VT323, Silkscreen). Tokens novos documentados
antes do refactor de front.

---

## 4. Pipeline de geração

```
[INPUT]   Form guiado (default) OU textarea livre "conta aí do seu jeito"
              ↓                                          ↓
        preenche direto                        LLM interpreta → mesmo schema
              ↓                                          ↓
[BRIEF]   ──────────────── CreativeBrief (Zod) ──────────────────
              ↓
[ENGINE]  A: regras + scoring autoral → PageSpec        [bootstrap/guiado]
          L: modelo local JEV-class → PageSpec          [quando treinado]
          B: LLM end-to-end → PageSpec                  [ablação eval]
          C: LLM propõe → L0 valida → fallback          [caminho livre]
              ↓
[COPY]    banco curado momento×tom → slots; LLM opcional por slot
              ↓
[OUTPUT]  PageSpec → Block[] → draft → EDITOR populado → reveal
```

### 4.1 Schemas âncora

```ts
const CreativeBrief = z.object({
  momento: z.enum([
    'crush_secreto', 'carta_amor', 'desculpas', 'anonimo',
    'convite_date', 'pedido_namoro', 'data_especial', 'so_porque_sim',
  ]),
  nomes: z.object({
    remetente: z.string().optional(),   // ausente se anônimo
    destinatario: z.string(),
  }),
  apelidos: z.array(z.string()).default([]),
  tom: z.enum(['cinematico','leve','vulneravel','misterioso','celebratorio']).optional(),
  coresFavoritas: z.array(z.string()).default([]),
  interesses: z.array(z.string()).default([]),
  contexto: z.string().optional(),
  anonimoParaDestinatario: z.boolean().default(false),
  restricoes: z.array(z.string()).default([]),
})

const PageSpec = z.object({
  version: z.literal(1),                // versionamento explícito (§3.1)
  templateFamily: z.string(),
  theme: z.object({
    palette: z.array(z.string()),       // cores do brief dentro do contraste
    typography: z.enum(['serifada','moderna','manuscrita']), // + 'pixel' se D3
    motionIntensity: z.enum(['sutil','expressivo','cinematografico']),
    atmosphere: z.string().optional(),
  }),
  sections: z.array(z.object({
    id: z.string(),
    layout: z.enum(['stack','columns','overlap','grid','freezone','fullbleed']),
    grid: z.object({ cols: z.number() }).optional(),   // regime D1
    theme: z.record(z.unknown()).optional(),
    modules: z.array(z.object({
      type: BlockType,
      props: z.record(z.unknown()),
      rect: z.object({                  // posição no grid (D1), opcional
        col: z.number(), row: z.number(), w: z.number(), h: z.number(),
      }).optional(),
    })),
  })),
  decisions: z.array(z.string()).optional(),  // trilha explicável (§4.2)
})
```

### 4.2 Engine — stack de decisão em 3 camadas (D9)

- **L0 — Regras duras (invariantes, autorais)**: `anonimo → remetente nunca
  aparece`; `desculpas → sem quiz lúdico`; `não se conhecem → sem timeline`.
  Executam sempre e primeiro — são guardrails, não scoring.
- **L1 — Modelo local de decisão estruturada** ("JEV-class"): modelo pequeno
  self-hosted que responde `Choice`/`Score` sobre o espaço finito de decisão.
  Pesquisa verificada (`stack-research.md` §4): **`@receptron/laya` é o único
  candidato que roda em-processo no Node** (onnxruntime-node) — CLM/Kev/
  NanoJev/SemIf exigem Python+GPU (violam §3.5); Knolli é miscategorizado
  (SaaS de copilot, fora). Alternativa: logprob readout sobre llama.cpp/
  Ollama sidecar (`notjev`/`choosekit` pattern). Ecossistema de dias-velho →
  pin de versão obrigatório.
- **L1 intermediário (pesquisa nova)**: L1v1 scoring autoral → L1v1.1
  embeddings pt-BR (`fastembed`/`transformers.js`, e5-multilingual, CPU) →
  L1v2 laya spike na Fatia 5. ⚠️ laya ~1.7GB RAM não cabe em Vercel
  serverless — exige processo persistente; L1v1 pode bastar.
- **Bootstrap**: L1 nasce como rules engine simples → decisões reais
  + curadoria viram dataset → fine-tune do modelo local → modelo assume o
  scoring, L0 continua como filtro/fallback.
- **L2 — LLM (Gemini)**: só interpretação de texto livre → `CreativeBrief` e
  personalização de copy slots. Nunca decide estrutura sem L0/L1 validar.
- **Fallbacks em cascata** e **`decisions[]` explicável** mantidos — toda
  escolha loga qual camada/regra decidiu (insumo do eval e depuração de gosto).

### 4.3 Pipeline triplo (D2) — comparável por construção

| Caminho | Estrutura | Copy | Custo/latência (hipótese a medir) |
|---|---|---|---|
| A. Regras (L0 + scoring autoral) | matriz | banco curado | ~0 / instantâneo |
| L. Modelo local de decisão | L1 (JEV-class) | banco curado | ~0 / ms |
| B. LLM end-to-end | LLM | LLM | maior / mais lento |
| C. Híbrido | L0 valida proposta LLM | LLM nos slots | baixo / ~segundos |

**Eval harness é deliverable de verdade** (D2+D13): conjunto fixo de briefs
representativos + rubrica — coerência momento→módulos, fit de tom, qualidade de
copy, diversidade entre gerações, taxa de fallback. **Juiz humano** em batches
pequenos (gargalo aceito — qualidade do julgamento > escala; LLM-as-judge pode
entrar depois como detector de regressão, não como oráculo). Resultado decide
o default de produção por caminho de input.

### 4.4 Custos & latência — hipóteses, não fatos

Números do brainstorm original ("centavos", "2-5s", "80% do valor") são
**estimativas a validar na Fatia 5** — provider definido: **Google Gemini**
(D10; Flash p/ extração, JSON mode; verificar DPA/termos de dados §10.3).
Mitigações
mantidas: cache por hash do brief normalizado, rate limit por IP/sessão,
skeleton animado no reveal, timeout com fallback determinístico.

---

## 5. Taxonomia de momentos (v1)

| Momento | Narrativa do reveal | Módulos signature | Tom |
|---|---|---|---|
| **Crush secreto** ★ slice | mistério → tensão → abertura | envelope → scratch → text → quiz leve | misterioso/leve |
| Carta de amor | intimidade → memória → futuro | envelope → text longo → timeline → photo book → music | íntimo |
| Desculpas | vulnerabilidade direta | text direto → polaroid → timer | vulnerável, mínimo |
| Anônimo | intriga → investigação → revelação | envelope selado → hints progressivos → quiz "adivinha quem" → scratch | intriga |
| Convite/date | casual → proposta → ação | text → **ticket RSVP** → timer | divertido |
| Pedido de namoro | buildup → clímax → celebração | envelope → timeline → scratch → music → bouquet | cinematográfico |
| Data especial | celebração → memória | polaroid → photo book → timer → bouquet | celebratório |
| Só porque sim | simplicidade | text + music | mínimo |

Paleta de todos: **dentro da paleta rose/vinho/blush existente** — sem dourado,
sem seções escuras (correção da crítica: versão anterior violava o light
theme). Se D3 virar identidade, essa tabela ganha um eixo `estética`.

### 5.1 Anônimo = anônimo para o destinatário

Remetente autenticado sempre → moderável. Mecânicas: dicas progressivas por
seção, quiz "adivinha quem" com tentativas, scratch de identidade (com opção
de nunca revelar), remetente acompanha views sem se expor. **Depender de
moderação (§10.3) antes de abrir publicamente.**

### 5.2 Input

Form guiado default (pills/steps, progressive disclosure por momento) +
textarea livre alternativo. O form mapeia 1:1 para `CreativeBrief`. Preview
vivo da página crescendo conforme preenche (gamificação do form).

---

## 6. Editor — constrained freeform (decisão D1)

Definição real do usuário: **structured canvas onde blocos se movem num grid e
redimensionam dentro de limites** — não só seções.

### 6.1 Modelo de dados

- `section` first-class: fundo/tema/layout próprios (`stack`, `columns`,
  `overlap`, `grid`, `freezone`, `fullbleed`).
- Seção `grid`: grid implícito (ex: 12 col); bloco carrega `rect {col,row,w,h}`
  com `w/h` em conjunto **limitado** (ex: spans 3-12 col, alturas em unidades).
- Seção `freezone`: posição absoluta contida (stickers, polaroids, doodles).
- Seção `stack`: comportamento atual — páginas existentes migram pra cá.
- **Mobile** (D12): grid colapsa pra stack com ordem **row-major automática**;
  usuário pode reordenar explicitamente num modo mobile (override opcional).

### 6.2 UX de edição

- Snap com guias, resize handles nos cantos, valores discretos (não livre).
- **Edição touch é o problema mais difícil do plano** — público edita no
  celular: drag de grid + resize por toque exigem design dedicado (handles
  grandes, modo "mover" explícito, undo generoso).
- Handoff pós-geração: reveal → editor abre com página pronta → hints
  contextuais → editar é opt-in por bloco.
- **Checklist de completude** (padrão "Testar" da pesquisa): painel mostra
  quais partes estão preenchidas/em branco, com jump-to-section e deep-link
  "editar em X" — o editor ganha um modo de conferência antes de publicar.
- **Reordenação por teclado** (padrão deles em fotos): espaço/enter pega,
  setas movem, Esc cancela — drag no grid precisa do mesmo tratamento.
- **AI actions por bloco** (novo, da crítica): "reescreve mais fofo / mais
  curto / mais engraçado" por bloco — provavelmente o uso de LLM de maior
  valor/risco; combate diretamente o "editor ruim".

### 6.3 O que fica de fora

Sem freeform absoluto de documento inteiro (B descartado): mobile quebraria,
engine decidiria espaço sem guardrails, e a audiência quer decorar, não fazer
layout.

---

## 7. Onboarding & funil (paywall pós-reveal — D4)

```
LP (pública) → momento picker (8 cards visuais)
  → form guiado (steps, preview vivo) OU textarea livre → LLM → brief
  → reveal cinematográfico (~segundos, skeleton animado)
  → "é seu — ajuste o que quiser" → editor populado
  → PAYWALL na publicação (D14: pay-per-publish, tudo incluído)
  → link público (com moderação)
```

Implicações de D4: gerador acessível sem login → **rate limit por IP/sessão,
drafts não publicados expiram, páginas públicas passam por moderação** (§10.3).
O reveal é o produto — motion design dedicado, não spinner.

### 7.1 Padrões validados — pesquisa meupresente.app (out/2025)

Concorrente BR mais próximo (mini-RPG pixel de casal, mesmo modelo
paga-pra-publicar). Mapa completo em `design-research/meupresente/NOTES.md`.
Padrões a adotar quase 1:1:

- **"Começar pelo exemplo"**: wizard nasce preenchido com a história demo e o
  usuário *edita* em vez de criar do zero — cold-start resolvido por
  modificação, não por form vazio. No nosso caso a geração já entrega isso;
  o equivalente direto é: form pode vir preenchido pelo texto livre (LLM) ou
  pelo exemplo do momento.
- **"Onde isso aparece"**: cada campo do form mostra a instância concreta no
  resultado ("na placa do café, fase 2"). O form ensina o modelo mental —
  candidato a matar o cold-start do editor sem tutorial.
- **"Se ficar em branco"**: painel lateral mostra o texto neutro exato do
  fallback. Transparência total — "nada é inventado no seu lugar" como valor
  explícito (alinhado com nosso determinismo/copy curado).
- **"No jogo, aparece assim"**: preview real do componente ao lado de cada
  campo — todo input de mídia tem seu cartão renderizado ao lado.
- **Rascunho no navegador sem cadastro** + código por e-mail na hora de
  publicar (passwordless OTP, sem senha) — zero atrito até o paywall; sync
  cross-device por magic link.
- **Etapa "Testar"** vira nosso checklist de preview no editor: matriz de
  completude por seção/módulo + "pré-visualizar esta parte" (jump direto) +
  deep-link "Editar em X" de volta ao campo certo.
- **Progresso de prévia namespaced**: quem cria testa sem sujar o progresso
  de quem recebe; "abrir como quem vai receber" em outra aba.

### 7.2 Paywall — referência deles vs. nosso D14

Deles: paga pra publicar **e** o pagamento libera as últimas 3 fases (o final
emocional fica travado no preview). Nosso D14 mantém tudo desbloqueado até a
publicação — mais generoso e transparente; o deles cria urgência de ver o
final. Registrar como variante de copy/design a testar no paywall (A/B na
Fatia 8): "veja o final" vs "publique pra ela ver".

---

## 8. Novos blocos & features

| Bloco | Tipo | Esforço | Detalhe |
|---|---|---|---|
| `youtube` | variante de `video` | trivial | embed (padrão deles: player oficial + dedicatória; sem buscar nada da API — só guarda o link) |
| `photoBook` | bloco | médio | `gallery` v2: page-flip 3D, capa, captions |
| `bouquet` | bloco (**killer**) | médio-alto | sprite-art generativo com seed, ver §8.1 |
| `ticketRsvp` | **feature** | alto | completo no launch (D6), ver §8.2 |
| `freezone` | bloco/canvas | médio | posição absoluta contida (§6) |
| `hints` | bloco | baixo | dicas progressivas do anônimo |
| `intimacyGate` | evolução de `quiz` | médio | "pergunta que só vocês sabem responder" como gate de reveal — com "Dica" e "seguir sem acertar" (ninguém trava no próprio presente). Serve crush, anônimo e casal (padrão validado: eles usam em 3 fases) |
| `memoryCard` | bloco | médio | unidade atômica de memória: selo lugar+data + foto/ilustração + legenda manuscrita + narrativa; photo book pode compor sequência delas |
| `hiddenNotes` | bloco | baixo | mensagens escondidas espalhadas pela página (easter eggs clicáveis) |
| `togetherCounter` | evolução de `timer` | baixo | conta "tempo juntos" a partir de data do brief ("4 anos, 3 meses e 29 dias") |
| AI actions | feature editor | médio | reescrita por bloco (§6.2) |

### 8.0 Repertório de mecânicas de reveal (catalogado na pesquisa)

O concorrente monta 12 mini-mecânicas de reveal no lugar de "ler texto":
ordenar momentos (ponte acende uma lanterna por acerto), procurar objetos
cobertos (reveal por proximidade), recolher pedaços e montar a frase, uma
flor floresce por motivo, jogo da memória com as fotos do casal, atravessar
pelas pedras certas, ligar estrelas → cada trecho revela um sonho, posicionar
objetos na casa, senha carinhosa na porta. Repertório pra nossos blocos terem
micro-interação própria — `scratch`, `quiz`/`intimacyGate`, `hiddenNotes` e
futuros blocos não devem ser só "card com texto".

### 8.1 `bouquet` — killer block

Flores procedurais — **revisado pós-D3**: com identidade pixel, o buquê vira
**sprite-art generativo** (flores compostas de partes pixeladas + dithering
para sombreamento), que é *mais simples* que bezier botânico e mais coerente
com a marca. Biblioteca de espécies (rosas, girassóis, tulipas, margaridas…),
cor por flor, quantidade, embrulho, laço — tudo parametrizado, determinístico
via **seed** (mesmo brief → mesmo buquê; "gera outro" = seed nova). Puxa
`coresFavoritas`/`interesses` do brief ("ela ama girassol"). Único no mercado,
compartilhável por natureza — um buquê pixel da pessoa é screenshot-ável.

### 8.2 `ticketRsvp` — completo (D6)

Visual de convite/ingresso: "Fulano te convida: cinema, sábado?" + botões
**Aceito / Não posso / Sugerir outro dia** + campo de texto + datas marcáveis.

Backend (por isso é feature): model `Response` (pageId, blockId, choice, text,
timestamp), endpoint autenticado por **token assinado na URL** (destinatário
sem login, uma resposta por token), **notificação ao remetente em todos os
canais** (D11): in-app + email + WhatsApp Business API — WhatsApp exige
templates aprovados e custo/mensagem → onboarding da API cedo; entrega
sequenciada: in-app+email primeiro, WhatsApp atrás de feature flag.
Investigar se `quiz` já persiste respostas pra reusar plumbing. Resposta =
climax viral do produto.

---

## 9. Landing page

### 9.1 Tese

Vende transformação, não editor: *"Você escreve como fala. A gente transforma
em algo que ela nunca vai esquecer."*

### 9.2 Estrutura

1. Hero: headline emocional + gerador/antes-depois funcionando
2. **Demo real** (§9.3)
3. Momentos (os 8 cards = entrada do onboarding)
4. Como funciona (3 beats)
5. Showcases dos blocos signature (bouquet, scratch, ticket, photo book)
6. Social proof / FAQ / pricing / CTA

### 9.3 Demo real (D7)

Página pública **polidida e gerada de verdade**, publicada quando o conjunto
estiver pronto — não placeholder. Rota indexável fora do robots disallow
(`/demo` ou `/exemplo`, não `/p/`,`/c/`,`/card/`). Se estética (D3) virar
marca, a demo é o showcase dela. Padrão validado: a demo deles abre **direto,
sem cadastro** (`/jogar?presente=demo` → intro → jogo) — zero fricção entre
"ver" e "querer".

### 9.4 Estética — decidida (D3)

**Pixel art / interfaces 2000-2010** como identidade de marca. A LP inteira
adota a linguagem retro-OS (janelas, dialogs, pixel type, dithering,
scanlines opcionais). Blocos signature ganham metáforas nativas: RSVP =
dialog de decisão, quiz = menu de RPG, música = player Winamp-like, envelope
= "1 nova mensagem". Variação de mood por momento dentro da mesma linguagem
(mesmo OS, wallpapers diferentes) — pedido de desculpas não pode virar piada.
Ver §3.6 para paleta e §13.1 para a decisão.

### 9.5 Ideias de LP da pesquisa (meupresente.app)

- **Slider comparativo de temas** no hero/showcase: mesmo conteúdo, climas
  diferentes — demonstra o eixo mood/estética sem palavra ("o mesmo mundo em
  três climas" deles = nosso "mesmo OS, outros wallpapers").
- **Showcase interativo de personalização**: montar algo na LP converte
  melhor que screenshot — deles, o casal sorteado acompanha o visitante até
  o fim da página (elemento persistente).
- Framing de preço validado: "Criar é de graça. Você só paga para publicar."

---

## 10. Backend — implicações

### 10.1 Endpoints/modelos

| Item | Detalhe |
|---|---|
| `POST /api/generate` | brief ou texto livre → PageSpec → Block[] → draft |
| Interpretação LLM | structured output → `CreativeBrief`; timeout+fallback |
| Template registry + copy banks | arquivos TS versionáveis, não DB |
| `Response`/`Rsvp` model | Prisma; pageId, blockId, choice, text |
| `POST /api/pages/:id/respond` | auth por token assinado, não sessão |
| Notificações | resposta RSVP → remetente (canal TBD) |
| Rate limit geração | por IP+sessão; mais estrito sem login |
| Cache | hash do brief normalizado → PageSpec |
| Moderação | ver §10.3 |

### 10.2 Migração de schema (Fatia 3)

`Block[]` plano → blocos com `sectionId` + `rect` opcional. Migração: páginas
existentes entram numa seção `stack` implícita. `PageSpec.version` desde o dia
0. Visual regression nas páginas existentes é critério de saída da fatia.

### 10.3 Moderação & safety (D8) — workstream real

Público inclui menores + dados de terceiros (destinatário: nome, gostos,
contexto) + modo anônimo + gerador público = obrigações:

- **LGPD art. 14** (melhor interesse do menor) como frame; dados do
  destinatário são de terceiro → aviso claro no fluxo do remetente.
- **DPA** com provedor LLM (texto livre pode conter dados pessoais de
  terceiros) + não treinar/não reter onde possível.
- **Moderação pré-publicação** de páginas públicas (automática + revisão em
  casos flagrados); **report/bloqueio** para destinatário.
- Rate limits, captcha no gerador público, expiração de drafts.
- Falso-positivo é o modo de falha: "amo você" não pode ser barrado —
  moderação calibrada pra abuso/CSAM/doxxing, não pra romantismo.

---

## 11. Sequência de fatias verticais (reordenada pós-alinhamento)

| # | Fatia | Entrega validável | Métrica de validação |
|---|---|---|---|
| 0 | **Pesquisa & auditoria** | auditoria UX do editor atual; 5+ sessões com público real; doc de direção estética (D3); baseline de métricas | artefatos entregues; decisão estética documentada |
| 1 | **Espinha dorsal** | CreativeBrief, PageSpec v1, compilePageSpec, engine, registry | suite de testes de decisão; `decisions[]` explicável |
| 2 | **Slice: crush secreto** | form → geração → editor populado → preview | tempo brief→página; % conclusão do onboarding; reveal funciona E2E |
| 3 | **Structured canvas + migração** | sections, grid+resize (D1), freezone, mobile collapse | páginas antigas renderizam idênticas; edição touch usável |
| 4 | **Taxonomia + moderação** | 8 momentos, copy banks v1, pipeline de moderação | todos geram; moderação bloqueia abuso sem barrar romantismo |
| 5 | **Pipeline triplo + eval** | texto livre→brief (Gemini); spike do modelo local de decisão; AI actions; harness A/L/B/C | acurácia de extração vs briefs rotulados; relatório comparativo; custo/latência medidos |
| 6 | **Blocos novos** | bouquet, photoBook, youtube, hints | cada bloco renderiza+edita+serializa round-trip |
| 7 | **RSVP completo** | resposta persiste + notifica | E2E: convite→resposta→notificação |
| 8 | **LP redesign + demo** | nova LP; gerador público; demo real | conversão LP→geração→publicação |

Notas: RSVP (D6 completo) ficou na fatia 7 mas o **backend dele pode iniciar em
paralelo** a partir da 3 — depende só de pages públicas existirem. LP (8) roda
paralela desde ~4; a demo é a última peça integrada.

---

## 12. Experiência de quem recebe (lacuna adicionada)

O link chega por DM/WhatsApp → abre em **in-app browser** num Android médio:

- Autoplay de áudio bloqueado → música precisa de gesto do usuário (design).
- WebGL instável em devices fracos → fallbacks: 3D→canvas 2D→imagem estática;
  bouquet SVG é leve; motionIntensity adaptativo por device.
- **Perf budget**: LCP alvo a definir; orçamento de JS por página gerada.
- RSVP/scratch/quiz funcionam por toque sem teclado.
- **Progresso resumável** (padrão deles): quem recebe pode parar e continuar
  depois — estado em storage local + "dá para parar e continuar depois" no
  copy de entrada.
- **A11y de recebimento**: live regions narrando progresso ("lembrança
  guardada"), skip links, `prefers-reduced-motion` — verificado no deles,
  replicar.

---

## 13. Parking lot

### 13.1 Estética — RESOLVIDO (D3, decisão do usuário 2026-10-11)

Pixel art / nostalgia digital 2000s = **identidade de marca**. A pesquisa de
estética na Fatia 0 muda de escopo: não é mais "qual direção" e sim referências
de execução — Orkut/MSN/Fotolog (âncora BR), Win98/XP, Mac OS 9, frutiger aero
como subreferência, pixel fontes com cobertura pt-BR, sistemas de cor retro.
Entregável vira design tokens "romantic OS" + moodboard, não decisão.

**Validação comercial (pesquisa out/2025):** meupresente.app prova o modelo —
pixel-art romântico pago funcionando no BR. Diferenciação nossa: múltiplos
momentos (eles só têm "casal"), RSVP que escreve de volta, editor com
composição livre-em-grid vs. template fixo deles. Eles também elevam a barra:
o pixel deles é craft alto — nosso piso de referência.

### 13.2 Demais ideias

- LLM-as-judge como detector de regressão futuro (oráculo continua humano — D13)
- "Gera outra" = reroll com seed nova
- Drafts não publicados expiram (cria urgência + limpeza)
- Sinergia Remotion: página gerada → export de vídeo automático
- Destinatário vira remetente (CTA na página recebida) = loop de aquisição
- Monitoramento de custo LLM por endpoint desde o início

---

## 14. Riscos

| Risco | Severidade | Mitigação |
|---|---|---|
| Copy cringe | **fatal** | banco curado humano; LLM só em slots/tom fixo |
| Expectativa "perfeito" | alto | promessa = ponto de partida lindo em ~30s |
| Páginas todas iguais | alto | eixo estética (D3) + seeds + diversidade no eval |
| Gerador público = spam/abuse | alto | rate limit, captcha, expiração, moderação (§10.3) |
| Anônimo → assédio a menores | alto | remetente autenticado; moderação; report/bloqueio; LGPD |
| Mobile do grid editor | alto | design touch dedicado; collapse rules claras |
| Device fraco do destinatário | médio | perf budget + fallbacks de render (§12) |
| Latência LLM | médio | só caminho livre; cache; skeleton; fallback |
| Operar modelo local (L1) | médio | nasce rules-only; modelo entra quando dataset existe; L0 sempre como filtro/fallback |
| Escopo big-bang | alto | fatias §11 com métricas; cada uma pode pausar |

---

## 15. Decisões pendentes restantes

Todas as decisões estruturais travadas (§2). Restam pendências de
implementação:

Resolvidas pela pesquisa (`stack-research.md`): ~~15.1~~ L1-v2 =
`@receptron/laya` (único Node-native); ~~15.2~~ Gemini paid tier não treina
(habilitar billing, nunca AI Studio com dados reais); ~~15.4~~ pipeline
blocklist→Perspective→Gemini definido (pedir quota increase do Perspective
AGORA — default 1 QPS); ~~15.5~~ Turnstile já implementado, só estender.

Pendências de implementação restantes:

| # | Item | Quando resolve |
|---|---|---|
| 15.3 | Onboarding WhatsApp Business API + opt-in checkbox no registro | iniciar cedo; opt-in desde já |
| 15.6 | Conteúdo da demo real (qual(is) momento(s) showcase) | Fatia 8 |
| 15.7 | ~~Estética marca vs tema~~ RESOLVIDO (D3): pixel/nostalgia-2000s = marca | pendente: tokens "romantic OS" (paleta+fontes) |
| 15.10 | Paleta "romantic OS" + fontes pixel pt-BR (cobre ç/ã/õ?) | antes de S15 (LP) / refactor de front |
| 15.8 | Laya vs serverless (onde hospeda o modelo de decisão) | Fatia 5 spike |
| 15.9 | Normalizar zod 3.x (backend) vs 4.x (frontend) p/ schemas compartilhados | Fatia 1 |

---

## 16. Estratégia de execução — sessões, orquestração e guardrails

### 16.1 Regra de ouro de delegação

**Delegável = dá pra escrever critério de aceite + teste.** Não delegável = a
spec *é* o trabalho (design, trade-offs, gosto editorial). Subagent não
carrega contexto entre execuções — recebe contrato, executa, devolve
artefato. Princípio central: **orquestrador gera contratos, executores
consomem contratos.**

### 16.2 Papéis e tiers de modelo

| Papel | Modelo | Responsabilidade |
|---|---|---|
| **Orquestrador** (main context) | frontier | contratos, arquitetura, decisões de gosto, integração, review de diffs, debugging sutil |
| **Executor** (subagent) | médio | implementação spec'd em domínio isolado, testes, endpoints |
| **Mecânico** (subagent) | barato/rápido | migrações mecânicas, i18n, lint, sumarização |
| **Humano** | — | curadoria de copy, juiz do eval (D13), decisões §15 |
| **qa-auditor** | — | typecheck+lint+test por sessão (`verify-all.sh`) |

### 16.3 Guardrails — preflight obrigatório antes de executar

Antes de iniciar qualquer sessão, o agente responde o checklist. **Qualquer
"não" = parar e reportar ao orquestrador — nunca improvisar.**

1. **Contratos existem?** — verificar os arquivos listados em `Gate` da
   sessão. Se faltam → a sessão não está madura. Nunca "assumir" um schema.
2. **Contexto lido?** — cada sessão exige um pacote de contexto (§16.4). Sem
   leitura, sem execução.
3. **Critério de aceite é testável?** — se não dá pra escrever o teste, a
   tarefa não é delegável → escalar pro orquestrador.
4. **Domínio declarado?** — arquivos fora do escopo da sessão são proibidos.
   Precisar tocar fora = parar e reportar, não expandir.
5. **Sem conflito de arquivo?** — nenhum outro agente ativo no mesmo path.

**Regra de escalada**: contexto insuficiente, contrato ambíguo ou requisito
fora de escopo → parar e reportar. Agente que "resolve sozinho" ambiguidade
de contrato produz retrabalho — parar é o comportamento correto, não falha.

**Regra do doc vivo**: executor reporta divergências encontradas;
orquestrador atualiza o plano/`stack-research.md` antes da próxima sessão.

### 16.4 Pacotes de contexto

| Pacote | Conteúdo | Quem precisa |
|---|---|---|
| **CTX-A** (universal) | `AGENTS.md` raiz + `AGENTS.md` do package + plano §2 (D1–D15) + §3.6 (regras UI) | todo agente |
| **CTX-B** (domínio) | arquivos-alvo + schemas/contratos relevantes + seção aplicável do `stack-research.md` | executor do domínio |
| **CTX-C** (orquestrador) | plano inteiro + stack doc inteiro + `SPEC.md` + histórico de decisões | só main context |

### 16.5 Sessões (ordem, modo, gates)

| # | Sessão | Modo | Gate de entrada (deve existir) | Critério de saída |
|---|---|---|---|---|
| S1 | **Contratos**: decisão zod shared (15.9), `CreativeBrief`, `PageSpec` v1, `Section`/`GridPlacement`, checklist de registro de bloco | main | plano §3–4 lido | schemas compilando; contrato documentado |
| S2 | **Auditorias F0** ×3: UX do editor, estética sem viés (D15), inventário de padrões | 3 subagents bg | CTX-A | 3 relatórios com issues ranqueados |
| S3 | **Engine + compiler**: L0 regras, L1v1 scoring, `compilePageSpec`, registry `crush_secreto` | main | S1 | suite de decisões verde; `decisions[]` |
| S4 | **Copy bank crush_secreto** + voice guide | sub | S1, S3 (formato de slots) | banco + cura humana aprovada |
| S5 | **Slice E2E crush**: momento picker → form → `/api/generate` → editor populado → reveal | main | S3, S4 | funil completo rodando em dev |
| S6 | **Schema migration**: `blocks` plano → sections/placement; páginas legadas migram p/ stack implícita | main | S1, relatório editor (S2) | páginas antigas renderizam idênticas (regressão visual) |
| S7 | **Grid editor**: drag+snap, resize limitado, freezone, collapse mobile (D12), touch | main | S6 | edição grid funciona em touch; 44px targets |
| S8 | **Copy banks ×7** momentos restantes | sub paralelos | S4 aprovado (guia+formato) | bancos curados |
| S9 | **Moderação + proteção**: pipeline L1/L2/L3, Turnstile p/ generate, rate limit, report/block | sub backend | CTX-A + stack §6; Perspective quota pedida | pipeline ativa; testes de falso-positivo |
| S10 | **Blocos novos** ×5: `bouquet`, `photoBook`, `youtube`, `hints`, `freezone` (1 sub cada) | sub×5 | S6 + spec do bloco (stack §5) + migração testada | serialize→render→edita round-trip |
| S11 | **Gemini**: texto livre→brief + AI actions por bloco + fallbacks | main | S3, S5; billing Gemini ativo | extração funciona; fallback L0 testado |
| S12 | **Eval + spikes**: harness A/L/B/C, spike laya, spike embeddings | sub + julgamento humano | S11; briefs rotulados | relatório comparativo; decisão L1 |
| S13 | **RSVP backend**: `Response` model, token assinado, cascata notificações | sub + review main | spec §8.2; WABA onboarding iniciado | convite→resposta→notificação E2E |
| S14 | **RSVP frontend**: `ticketRsvp` block | sub | contrato S13; patterns de S10 | bloco responde E2E |
| S15 | **LP redesign** | main | relatório estética (S2); copy S8 | nova LP |
| S16 | **Demo real + polish** | main | S15 + blocos S10 | `/demo` pública indexável |

Dependências cruzadas: S10 depende só de S6 (pode correr paralelo a S7–S9);
S13 depende de páginas públicas existirem (pode começar cedo); S15 pode
começar quando S2 entrega o relatório de estética.

### 16.6 Nunca delegar (lista explícita)

- Design/edição de `CreativeBrief`, `PageSpec`, `Section` — contratos-mãe
- Pesos da scoring matrix e regras L0 — gosto editorial codificado
- Reveal + fluxo de onboarding — o momento "caralho" do produto
- Curadoria final de copy — pt-BR coloquial, julgamento humano
- LP redesign — craft é single-author; dividir = Frankenstein
- Rubrica de eval — eu escrevo, humano julga
- Qualquer mudança de contrato de API/persistência sem SPEC.md atualizado

### 16.7 Protocolo de handoff

Executor entrega: diff + relatório curto (o que fez, o que divergiu do plano,
o que faltou de contexto). Orquestrador faz review antes de integrar; gosto
editorial fica centralizado no main context. Divergências → atualizar docs
vivos antes da próxima sessão.

---

## 17. Glossário

- **CreativeBrief**: schema Zod da intenção (form ou texto livre → mesmo formato)
- **PageSpec**: schema intermediário versionado (sections, modules, tema, rect)
- **Engine**: stack de decisão L0 (regras) + L1 (modelo local JEV-class) + fallback
- **System One / JEV-class**: classe de modelos pequenos de decisão estruturada
  (`Choice`/`Score`) — Jev, CLM, Kev, Laya, NanoJev — alternativa local e
  barata a LLM generativo para decisões em espaço finito
- **Momento**: categoria da situação (crush, pedido…) → família de template
- **Constrained freeform**: regime D1 — grid com snap + resize limitado
- **Freezone**: seção de posicionamento absoluto contido (stickers/doodles)
- **SLC**: Simple, Lovable, Complete — fatia mínima amável e completa
- **Frutiger aero**: estética ~2004-2013 (gloss, translucidez, natureza-tech)
  — candidato de identidade visual (D3)
