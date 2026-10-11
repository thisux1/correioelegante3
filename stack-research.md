# Stack Research — Decisões de Implementação

> Pesquisa executada em 2026-09-28 (4 frentes paralelas, verificada via
> GitHub/npm/docs). Doc irmão: **`generative-editor-plan.md`** — este doc
> responde "como construir" o que o plano decide.
> Status: **documento vivo** — recomendações revisáveis; deps novas devem
> respeitar a regra de >7 dias de publicação do repo.

---

## 1. Resumo executivo

| Área | Decisão recomendada | Deps novas |
|---|---|---|
| Grid editor | **Custom sobre `@dnd-kit` (já instalado) + CSS Grid** | `~0` (+`@dnd-kit/modifiers` ~2kB) |
| Engine L0 | Regras duras hand-rolled (não usar rules lib) | 0 |
| Engine L1-v1 | Scoring ponderado hand-rolled | 0 |
| Engine L1-v1.1 | Embeddings pt-BR via `fastembed` ou `@huggingface/transformers` | ~30-500MB modelo |
| Engine L1-v2 | **`@receptron/laya`** (único JEV-class que roda em Node) | ~400MB-1.7GB RAM ⚠️ |
| LLM | **Gemini 2.5 Flash paid tier** + `responseJsonSchema` + Zod | `@google/genai` |
| Bouquet | **SVG paramétrico custom + mulberry32** (zero dep) | 0 |
| Photo book | **CSS 3D flip custom + framer-motion** (já instalado) | 0 |
| Scratch | **Fixes na implementação existente** (perf bug) | 0 |
| Freezone | **DOM + pointer events + `@use-gesture/react`** | ~12kB gz |
| Bot protection | **Turnstile já implementado** — estender p/ `/api/generate` | 0 |
| Moderação | blocklist → Perspective API → Gemini Flash moderator | 0 |
| Notificações | in-app + web push (`web-push`+VAPID) + Resend + WhatsApp Cloud API | `web-push` |
| Email | **Manter Resend** (já integrado) | 0 |

Total de dependências novas no runtime do frontend: **~14kB gz**. Notável para
4 blocos novos + editor grid.

---

## 2. Inventário do que JÁ existe (não reinventar)

Verificado no codebase:

| Existe | Local | Reuso |
|---|---|---|
| `@dnd-kit` core+sortable+utilities | `frontend/package.json` | grid editor inteiro |
| Turnstile middleware (fail-closed, `TURNSTILE_DISABLED`) | `backend/src/middlewares/turnstile.middleware.ts` | estender p/ generate/respond/publish |
| Turnstile component | `frontend/src/components/ui/Turnstile.tsx` | idem |
| Resend + templates pt-BR (652 linhas) | `backend/src/services/email.service.ts` | RSVP notifications |
| `alert.service.ts` (alertas internos via ticket+email, dedupe) | `backend/src/services/` | padrão p/ notificações |
| `express-rate-limit` global + por rota | `backend/src/app.ts` | limiter estrito no `/api/generate` |
| Gestures: pointer capture, rotate-drag, resize handles | `PolaroidBlock.tsx` L118-237 | playbook do freezone |
| Drag-handle pattern (`handleProps`/`setActivatorNodeRef`) | `BlockWrapper.tsx` | grid drag |
| Coarse-pointer gating + botões move up/down | `EditorCanvas.tsx` L42-69 | mobile collapse do grid |
| rAF-throttled scratch canvas | `InteractiveScratchCanvas.tsx` | portar fix p/ `ScratchBlock` |
| `colorHarmonizer` | `frontend/src/editor/utils/` | mapear coresFavoritas→paleta |
| `templates.ts` com sequências exemplares | `frontend/src/editor/` | base do template registry |
| `useReducedMotion` | `GalleryBlock.tsx` | todos os blocos novos |
| Cloudinary (transforms p/ downscale) | backend | photo book images |
| Lazy-load de blocos pesados | `BlockRenderer.tsx` L8-66 | pattern pronto |

**Discrepâncias encontradas**: AGENTS.md cita GSAP — **não está instalado**
(motion = framer-motion + lenis apenas). Backend usa `zod@3.24`, frontend
`zod@4.3.6` — versões divergentes a normalizar quando schemas forem
compartilhados.

**Constraints que afetam design**: `MAX_BLOCKS = 30`, `MAX_PAGE_BYTES =
500_000` (`types.ts` L200-205); `migration.ts` **silenciosamente rebaixa bloco
desconhecido para `text`** (L79-98) — todo bloco novo exige entrada em
`asBlockType`/`migrateBlock`, senão páginas publicadas perdem blocos.

---

## 3. Grid editor — DECISÃO: custom sobre `@dnd-kit` + CSS Grid

### Por quê

1. O spec ("constrained freeform": snap em células, clamp, resize discreto) é
   **mais simples** que o que RGL/gridstack vendem — o maquinário deles
   (collision-push, compaction, breakpoint engines) é semântica de dashboard
   que *atrapalha* editor de documento. Em RGL você desligaria o compactor no
   primeiro dia e lutaria contra os defaults.
2. Os problemas caros já estão resolvidos no codebase: drag-handle, activation
   constraints, `isDragging` no store, KeyboardSensor, gating por pointer.
3. Touch controlável, não delegado: `PointerSensor` com `distance/delay/
   tolerance` tunável — bloco nunca disputa com scroll da página.
4. `{col,row,w,h}` vive no Zustand como source of truth — sem sync loop de
   `onLayoutChange`.
5. Zero bytes novos. Plano B legítimo: **react-grid-layout v2** (revivido,
   rewrite TS dez/2025, MIT) se um dia quiser collision/toolbox.

### Rejeitados

gridstack (React via portals imperativos, briga com arquitetura), pragmatic-dnd
(touch = long-press HTML5 nativo — **desqualificante** pro público), interact.js
(segundo sistema de pointer), tldraw (licença comercial), craft.js/grapesjs
(abstração errada — page builder framework).

### Modelo de dados

```ts
interface GridPlacement { col: number; row: number; w: number; h: number }
interface Section {
  id: string
  layout: 'stack' | 'columns' | 'grid' | 'freezone'
  grid?: { cols: 12; rowHeight: number; gap: number }
  blockIds: string[]
  placement: Record<string, GridPlacement>  // blockId → rect
}
// Page ganha sections[]; blocks[] plano permanece (content) —
// placement mora na Section (seções são donas de geometria).
```

### A "biblioteca" inteira é ~isto

```ts
const snapToCell: Modifier = ({ transform }) => ({
  ...transform,
  x: Math.round(transform.x / cellPitchX) * cellPitchX,
  y: Math.round(transform.y / cellPitchY) * cellPitchY,
})
// dragEnd: newCol = clamp(1, cols-w+1, col + round(dx/pitchX))
// resize: handle com pointer-capture, delta → células → commit w/h (~200 LOC)
```

`display:grid` real (`grid-column/row`) dá rows implícitos + reflow animado
via framer-motion `layout` (pattern já usado no EditorCanvas). Mobile collapse
(D12): sort `placement` por `(row,col)` row-major; reordenação mobile reescreve
`row` sequencialmente (~20 linhas, testável).

**Esforço**: ~1-2 dias core + edge cases (overlap policy, min-size por bloco,
a11y teclado via KeyboardSensor). Esforço total da fatia inclui UI: ver §11.

---

## 4. Engine de decisão — JEV-class verificado

### 4.1 Verificação dos projetos citados

O ecossistema é **real** — Jev (TypeSafe AI) lançado 2026-09-15; clones
surgiram em dias. Todos existem, com correções:

| Projeto | Status | Correção importante |
|---|---|---|
| Jev (TypeSafe AI) | ✅ real | hosted-only, closed, waitlist; primitivas Choice/Noul/Score confirmadas |
| CLM | ✅ real | nome errado: é "Contrastive Language Models"; head sobre Qwen3-8B congelado; **precisa GPU+vLLM+Python** |
| Kev (Jared Palmer) | ✅ real | Apache-2.0, drop-in wire-format, LoRA sobre Qwen2.5-0.5B; **Python/GPU** |
| Laya (Convai) | ✅ real | dois checkpoints: `laya` 421M inglês; `laya-multilingual` 322M (a claim fundiu os dois) |
| SemIf | ✅ real | logit readout sobre Qwen3.5-4B; Python+GPU |
| NanoJev | ✅ real | 0.6B, CUDA-only, research-grade |
| jevlike | ✅ real | starter didático de treino em CPU |
| Knolli | ⚠️ **miscategorizado** | SaaS de copilot/RAG, não é modelo de decisão — **remover da lista** |

**Descoberta chave**: `@receptron/laya` (npm) roda Laya **em-processo no Node**
via onnxruntime-node (weights ONNX fp32+quantized no HF). É o **único**
JEV-class compatível com §3.5 ("sem serviço Python"). Alternativas:
`notjev`/`choosekit` (logprob readout de 1 token sobre llama.cpp/Ollama —
"System One de graça" com weights stock, 25-150ms) ou sidecar llama.cpp com
JSON-schema→GBNF.

**Caveat de maturidade**: ecossistema de dias/semanas — benchmarks
auto-reportados, APIs vão mudar. **Pin de versão obrigatório.**

### 4.2 Caminho recomendado (ordem)

```
L0  regras duras (1-2d)           — sempre, primeiro, sempre ligadas
L1v1 scoring ponderado (2-3d)     — ship v1; decisions[] = labels futuros
L1v1.1 embeddings pt-BR (+2-3d)   — fastembed/transformers.js, e5-multilingual;
                                    embeddings de "affinity phrases" pré-computados
                                    em build-time; ~10-50ms/brief em CPU
L1v2 @receptron/laya spike (Fatia 5) — benchmark vs L1v1 no eval harness
```

`templateFamily` é **lookup determinístico** por momento (tabela §5 do plano já
está autora) — modelo não agrega nada ali. Onde fuzzy matching agrega:
`interesses`/`contexto` → afinidade de módulos, inferência de `tom`.

### 4.3 ⚠️ Flag arquitetural importante

`@receptron/laya` (~400MB-1.7GB RAM) **não cabe em Vercel serverless** —
exige processo persistente (container Railway/Fly/VPS ou sidecar). Opções:
(a) backend principal migra/sai de serverless pra decisões; (b) L1 fica em
rules+embeddings (embeddings ONNX pequenos podem caber); (c) sidecar dedicado
só pro decision model. Decidir na Fatia 5 com dados do spike. L1v1
(rules+embeddings) **já entrega o valor** — L1v2 é upgrade mensurável pelo
eval, não dependência.

### 4.4 Bootstrap de dados (dataset do modelo local)

1. Log `{brief, pageSpec, decisions[], layer}` por geração + sinais pós-hoc
   (edições por bloco, publish/discard)
2. Silver labels = output das rules; gold = curadoria humana (reusa os batches
   de eval humano — D13)
3. Augmentação sintética: grade momento×tom×interesse com mutações
4. Teacher distillation: outputs aceitos do caminho C viram rows de treino
5. Calibração: temperature fitting em ~500 rows held-out (receita publicada
   do Kev usa 512)

---

## 5. Blocos generativos

### 5.1 `bouquet` — SVG paramétrico custom + mulberry32

- **SVG > Canvas**: resolution-independent, zero WebGL (seguro em webviews),
  props minúsculas `{seed, flowers:[{species,color}], wrap, bow}` — geometria
  regenerada, nunca armazenada. Export→PNG: `XMLSerializer`→Blob→canvas (sem
  taint se não usar `foreignObject`).
- **Determinismo**: `mulberry32` inline (~10 linhas) keyed em `seed` — mesmo
  seed → mesmo buquê em todo device. "Gera outro" = seed nova.
- **Técnicas verificadas**: pétalas = cubic-bezier fechados; rosas = curvas
  polares `r=A·|cos(kθ)|` com corolas internas; miolo de girassol/margarida =
  **filotaxia** `θ=n·137.508°, r=c·√n` (golden angle); hastes = quadratics
  convergindo ao grip; embrulho = trapézios sobrepostos + gradiente.
- **Refs OSS**: `vector-bloom` (MIT — melhor referência estrutural, vendor/fork
  não depend), `GoldenSeeds` (React+SVG paramétrico), `crypto_flora` (seed→params).
  p5.js descartado (~1MB). rough.js opcional p/ variante "sketch" (9kB, dormant
  mas estável).
- **Mobile**: cap ~25 flores, sem feGaussianBlur, DOM <800; fallback render-once→PNG.
- **Esforço**: 1.5-2.5 semanas pra craft premiável (4 espécies + wrap + laço +
  controles no editor + export).

### 5.2 `photoBook` — CSS 3D flip custom + framer-motion

- StPageFlip dormant desde 2021; `react-pageflip` tem peer-dep React 17.
  Com `MAX_GALLERY_IMAGES=10` são ≤5 spreads — problema DOM-native bounded.
- Técnica: `perspective` + `preserve-3d`, folhas com `transform-origin: left`,
  faces front/back (`backface-visibility`), z-index re-stack por página.
  framer-motion: `useMotionValue` drag-follows-finger + spring no release.
  GPU-composited sem WebGL.
- **Esforço**: ~4-6 dias polido (capa hard-flip, captions, reduced-motion→crossfade).

### 5.3 `scratch` — fix na implementação existente (~1-2 dias)

Duas implementações já existem. Fixes: **bug de perf** (`ScratchBlock.tsx:169`
roda `getImageData` a cada pointermove — portar o throttle rAF de
`InteractiveScratchCanvas`), `getCoalescedEvents()` p/ strokes suaves, redraw
on resize, cover texturizada (foil), brush em formato de coração, **a11y**:
botão "Revelar" + `aria-live` + `role="img"`.

### 5.4 `freezone` — DOM + pointer events + `@use-gesture/react`

- DOM (não canvas): itens são polaroids/stickers — reusar playbook de
  `PolaroidBlock` (pointer capture, rotate-by-drag −45°..45° + snap magnético,
  resize handles). Posições em **% do container** + transform GPU.
- Única dep nova: `@use-gesture/react` (~12kB gz) — pinch-rotate nativo
  (`onDrag`+`onPinch`); o resto é custom.
- Serialização: `FreezoneItem[] {id,kind,src,xPct,yPct,rotationDeg,scale,z}`
- Preview: composição congelada v1 (rearranjo efêmero do viewer = v2).
- Rejeitados: tldraw (licença paga), fabric/konva (overkill), react-moveable
  (dormant + chrome incompatível).
- **Esforço**: 4-7 dias.

---

## 6. Infra — resolvido pela pesquisa

### 6.1 Bot protection (resolve §15.5)

**Turnstile já implementado** — só estender p/ `POST /api/generate`, publish e
respond. Detalhes: token expira em 300s → gerar no submit (execute mode); layer
com rate-limit estrito (ex: 5/h IP, 20/dia) + honeypot + expiração de drafts.
Não trocar por reCAPTCHA (free tier 10k/mês, mais pesado, tracking = LGPD
pior).

### 6.2 Moderação (resolve §15.4)

```
PUBLISH → L1 blocklist+regex PII (tel/CPF/email/endereço, slurs)
        → L2 Perspective API (free, pt-BR nativo; THREAT/IDENTITY_ATTACK/
          SEVERE_TOXICITY; ⚠️ default 1 QPS — pedir aumento AGORA; doNotStore)
        → L3 Gemini Flash moderator (prompt pt-BR com política exata:
          "romance ok; flag doxxing, ameaça, sexualização de menores,
          stalker em modo anônimo"; structured output {verdict,reasons})
        → PASS publica | FLAG fila de revisão humana | HARD FAIL rejeita
+ "Denunciar"/"Bloquear" em toda página pública (rede de segurança do anônimo)
```

Falsos-positivos são o modo de falha: `PROFANITY` do Perspective com threshold
alto (pt-BR romântico usa palavrão afetuoso); OpenAI `omni-moderation` = plano
B gratuito (tem `sexual/minors`) atrás de interface. Imagem depois:
omni-moderation aceita imagem grátis; PhotoDNA/SaferNet quando uploads
abrirem. Custos L3: ~$0.001-0.002/página.

### 6.3 Notificações RSVP (D11 — todos os canais)

Cascata por custo: **in-app** (badge/dashboard) → **web push** (`web-push` +
VAPID — zero vendor, free; iOS só PWA instalado 16.4+) → **email** (Resend já
integrado) → **WhatsApp** (Meta Cloud API direto, sem BSP):

- Utility template ≈ **R$0,035/msg** → 1k RSVPs/mês = ~R$35. Custo real é
  operacional (WABA, quality rating, templates).
- **Opt-in legal**: checkbox no registro/Settings ("Aceito receber notificações
  pelo WhatsApp") — guardar timestamp + texto exato (prova LGPD).
- Starter limit: 250 conversas business-initiated/24h — suficiente.
- Template approval: minutos (ML) a 48h — submeter cedo (§15.3 confirmado).
- Sequência de entrega: in-app+push+email primeiro; WhatsApp atrás de flag.

### 6.4 Gemini (D10) — resolve §15.2

- **Structured output**: `responseJsonSchema` nativo (2.5 Flash/Lite/Pro,
  2.0 Flash); schemas Zod funcionam direto no GenAI SDK.
- **LGPD crítico**: free tier **treina** com seus dados ❌; **paid tier não
  treina** ✅ — habilitar Cloud Billing transforma todo uso em "Paid Service".
  Nunca colar dados de usuário no AI Studio (sempre tratado como unpaid).
  DPA formal = Vertex AI (mesmo preço); AI Studio API paid = ok pro launch.
- **Pricing**: 2.5 Flash $0.30/$2.50 por 1M in/out; Flash-Lite $0.10/$0.40
  (4x mais barato no input — candidato pra extração em volume).
- Estimativa: ~$0.001-0.005/geração — hipótese agora fundamentada, medir na F5.

---

## 7. Dependências novas — lista completa

| Dep | Onde | Tamanho | Quando |
|---|---|---|---|
| `@dnd-kit/modifiers` | frontend | ~2kB gz | Fatia 3 |
| `@use-gesture/react` | frontend | ~12kB gz | Fatia 6 (freezone) |
| `@google/genai` | backend | — | Fatia 5 |
| `web-push` | backend | — | Fatia 7 |
| `fastembed` ou `@huggingface/transformers` | backend | modelo 30-500MB | Fatia 5 (L1v1.1, opcional) |
| `@receptron/laya` | backend | ~400MB-1.7GB RAM | Fatia 5 spike (opcional) |

Zero dependências de grid, bouquet, photo book, scratch. Versões novas devem
ter >7 dias de publicação (policy do repo) — o ecossistema JEV é dias-velho:
**pin exato + revisão antes de adopt**.

---

## 8. Riscos & flags da pesquisa

| Flag | Ação |
|---|---|
| Laya não cabe em serverless (~1.7GB) | Fatia 5 decide: L1v1+embeddings pode bastar; sidecar só se eval justificar |
| Perspective default 1 QPS | Pedir aumento de quota **agora** (lead time desconhecido) |
| Ecossistema JEV dias-velho | Pin versions; tratar benchmarks como claims de vendor |
| WhatsApp WABA setup | Onboarding cedo (lead time real é aprovação de negócio, não técnica) |
| `migration.ts` downgrade silencioso | Teste de migração por bloco novo é obrigatório |
| GSAP citado mas não instalado | Corrigir AGENTS.md ou adotar (motion atual: framer+lenis) |
| zod 3.x backend vs 4.x frontend | Normalizar ao compartilhar schemas PageSpec/Brief |
| AI Studio ≠ API paid | Nunca prototipar prompts com dados reais no AI Studio |
