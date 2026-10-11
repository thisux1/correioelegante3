# Auditoria de UX — Editor de Blocos do Correio Elegante

> **Fatia 0 / S2** do `generative-editor-plan.md` (§11, item "auditoria UX do editor atual").
> Auditoria estática de código na branch `feature/generative-spine` (2026-10).
> Escopo: `frontend/src/pages/Editor.tsx`, `frontend/src/editor/**`, serviços e contratos de persistência (frontend + backend) — porque metade da "UX" do editor vive no que ele faz com os dados.
> Severidades: **fatal** (perda de dados / promessa quebrada), **alto** (trava ou frustra o fluxo principal), **médio** (atrito concreto), **baixo** (polimento).
> Esforço de correção: **B** (<1 dia), **M** (1–3 dias), **A** (>3 dias / arquitetural).

---

## 1. Sumário executivo

O editor é tecnicamente sofisticado (DnD com keyboard sensor, drafts com resolução de conflito, feature flags end-to-end, pipeline de mídia com polling) mas falha nos dois pontos que mais importam para o produto:

1. **A persistência mente para o usuário.** Duas camadas de sanitização (frontend `migration.ts` + backend `page.sanitizer.ts`/`page.migration.ts`) podam silenciosamente campos que a UI permite editar: **toda a formatação de texto rica é destruída no save** e **o tema personalizado "Cores da Sua Pessoa" é revertido ao default**. O editor parece funcionar na sessão (estado local + localStorage) e o usuário só descobre a perda depois de publicar ou recarregar.
2. **Não existe "salvar" como verbo.** Página nova nunca autosalva (`useEditorAutosave` exige `pageId` + `version`), e o prop `onSave` da toolbar é declarado mas nunca renderizado — a única persistência remota está acoplada ao CTA "Publicar e Enviar Carta", que leva ao pagamento. Combinado com **zero undo** e **um único rascunho global** que vaza entre páginas, o editor hoje é mais arriscado do que deveria para a audiência menos técnica possível.

A direção "editor como refinamento" resolve o cold-start de conteúdo, mas **amplifica** os fatais: páginas geradas bonitas serão degradadas no primeiro save (mesmo pipeline), e deleções/ajustes sem undo machucam mais quando o conteúdo inicial era bom.

**Top 5 por impacto:**
| # | Issue | Severidade | Esforço |
|---|---|---|---|
| F1 | Formatação de texto rica é destruída no save (backend whitelist) | fatal | M |
| F2 | Tema "Cores da Sua Pessoa" (`persona:*`) normalizado ao default no save | fatal | B |
| F4 | Não existe salvar rascunho — persistir == publicar/pagar | fatal | M |
| F3 | Rascunho único global vaza entre páginas; "Em branco" não é em branco | fatal | M–A |
| A1 | Preview do editor ≠ experiência real do destinatário (unboxing, card, footer) | alto | M |

---

## 2. Achados FATAIS

### F1 — Formatação de texto rica é destruída no save (perda silenciosa de dados) · `M`

O TextBlock é o componente de edição mais complexo do sistema (1252 linhas, `frontend/src/editor/blocks/TextBlock.tsx`): categorias (title/body/quote/signature), 12 fontes, tamanhos, cor, alinhamento (incl. `justify`), bold/italic/underline e highlights `<mark>` persistidos em `props.html`. A migração **frontend** preserva tudo (`frontend/src/editor/migration.ts:249-278`, testado em `migration.test.ts:288-358`).

Mas o **backend** rebaixa `text` para `{text, align}` em duas camadas:
- `backend/src/services/page.migration.ts:167-174` — `sanitizePropsByType('text')` retorna só `{text, align}`.
- `backend/src/services/page.sanitizer.ts:180-187` — idem; e `sanitizeText` (`:21-28`) ainda stripa todo HTML de `text`.
- `align` só aceita `center|right` — `justify` é rebaixado para `left` (ambas as camadas).

Resultado: `html`, `category`, `fontFamily`, `fontSize`, `color`, `letterSpacing`, `lineHeight`, `bold`, `italic`, `underline` são **apagados a cada `savePage`/`updatePage`**. O quote vira parágrafo, a assinatura perde a cursiva, o título perde a fonte — sem erro, sem aviso. O round-trip save→reload devolve texto cru. Isso também atinge qualquer HTML serializado em `text` (quebra de linha `<br>` gerada em `TextBlock.tsx:285`).

**Por que é fatal**: é exatamente o valor do produto (craft tipográfico) que evapora. E é o padrão exato que o plano repetirá com sections/grid — ver §8.
**Correção**: estender as whitelists backend para os props atuais de `TextBlockProps` (`types.ts:31-44`), sanitizando `html` com allowlist equivalente a `htmlSanitizer.ts`; adicionar teste de round-trip backend por tipo (o `generate/README.md` já exige isso como passo 8).

### F2 — Tema "As Cores da Sua Pessoa" (`persona:*`) é resetado ao default no save · `B`

Feature de destaque do ThemeMenu (`EditorToolbar.tsx:283-368`): o usuário escolhe a cor favorita da pessoa amada + mood dia/noite, gerando ids como `persona:#e11d48:dark` (`frontend/src/editor/utils/colorHarmonizer.ts:283-321`).

O backend valida tema com `THEME_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/` (`backend/src/services/page.migration.ts:41`) — `:` e `#` falham → `normalizeThemeId` retorna `'romantic-sunset'` em `sanitizePageContent` (`page.sanitizer.ts:319`). Toda página com tema persona salva **volta pro tema default** no próximo reload/publicação.
**Correção**: incluir formato persona no regex/contrato backend (ou serializar persona de outra forma).

### F3 — Rascunho único global vaza entre páginas; "Em branco" não é em branco · `M–A`

O store persiste um **único** draft em `localStorage['editor-draft']` com um `draftPageId` (`frontend/src/editor/store/editorStore.ts:336-344`). O AGENTS.md documenta `ce_page_draft_<id>` por página — doc e código divergem. Consequências:

- **`/editor` sem pageId não resolve precedência** — `usePageHydration` retorna cedo (`Editor.tsx:256-259`), então o draft de *outra página* (draftPageId=X) renderiza como "novo rascunho". O card "Em branco" de `/create` (`Create.tsx:80-106`) não garante página em branco: mostra a carta anterior sem indicar de qual página ela é. Publicar isso cria uma **duplicata** da página X.
- **Navegar A→B destrói o rascunho local de A** — ao hidratar B, `applyBackendPage`→`setPage` substitui `blocks` e `setDraftContext(B.id)` (`Editor.tsx:535-543`); o draft não sincronizado de A é sobrescrito em silêncio.
- Com o funil generativo público/pré-login (plano §7: "rascunho no navegador sem cadastro"), múltiplas páginas anônimas vão colidir num slot único — o problema piora por construção.
**Correção**: namespacing real por pageId (`ce_page_draft_<id>`) + draft anônimo separado + botão "Começar do zero" que reseta o editor (`resetEditor` já existe, `editorStore.ts:333`) com confirmação.

### F4 — Não existe salvar rascunho: persistir == publicar/pagar · `M`

- Autosave remoto exige `hasPageId && pageVersion !== undefined` (`Editor.tsx:385-387`) → **uma página nova nunca autosalva**. Só ganha `pageId` quando `savePage` cria via POST e `navigate(/editor/:id)` (`Editor.tsx:610-611`) — que só acontece pelo fluxo de publicação.
- A toolbar recebe `onSave` como prop (`EditorToolbar.tsx:81,943,1068`) mas `ToolbarControlsComponent` **nunca o desestrutura/renderiza** (destructure em `:441-462` omite `onSave`) — não existe botão Salvar. Prop morta.
- Caminho real: "Publicar e Enviar Carta" (`Editor.tsx:991-1029`) → `handlePublish` salva e, para não-assinante, `window.location.assign('/payment/page/:id')` (`:784-785`) — sair do editor para pagar é a única forma de persistir.
- Indicador fica eternamente em "Novo rascunho ainda não salvo" (`Editor.tsx:869`) mesmo com localStorage ativo.
**Correção**: criar a página no primeiro save (ou via botão "Salvar rascunho" explícito), depois autosave normal. Barato e desbloqueia o mental model "rascunho seguro".

### F5 — Zero undo/redo · `A`

`editorStore` não tem histórico — nenhuma ação é reversível:
- Deletar bloco tem modal ("não pode ser desfeita", `EditorCanvas.tsx:646-668`) — mas edições destrutivas não têm nada: aplicar template por cima (`applyTemplate`, `Editor.tsx:556-567`), "Recarregar servidor" no erro 409 (`:885-896`), sobrescrever props.
- O plano §6.2 já pede "undo generoso" para edição touch. Num editor de refinamento, a ação mais comum (deletar/ajustar conteúdo gerado bom) é a mais irreversível.
**Correção**: command stack ou ring buffer de snapshots de `blocks` (imutável já ajuda — cada update gera array novo). Mínimo viável: undo de delete + reorder + update de props.

---

## 3. Achados ALTOS

### A1 — Preview do editor ≠ experiência real do destinatário · `M`

O modo preview (`Editor.tsx:975-984`) renderiza `PageRenderer` nu dentro do container do editor. A página pública (`pages/PageCard.tsx`) entrega **outra experiência**:
- `EnvelopeUnboxing` fullscreen **sempre**, mesmo sem bloco envelope (`PageCard.tsx:168-175`) — ritual de abertura que define o produto e o editor não mostra.
- `CardTilt3D` + card `max-w-3xl border-2 bg-gradient` (`:188-190`).
- Footer viral "Crie um correio elegante você também" (`:192-205`).

O "modo Smartphone" do preview testa largura, não a experiência. Usuário publica sem nunca ver o reveal que o destinatário vê — e o plano diz que **o reveal é o produto**.
**Correção**: preview "como destinatário" renderizando o mesmo fluxo do PageCard (ou extrair componente compartilhado).

### A2 — Sem inserção posicional nem duplicação de bloco · `B–M`

`addBlock` só faz append no fim (`editorStore.ts:189-190`). Inserir no meio = adicionar no fim + mover N vezes (mobile: N toques em ↑, `BlockControls.tsx:89-116`; desktop: drag). Não existe "duplicar bloco" — natural para polaroids/memórias e para o futuro `memoryCard`.
**Correção**: "+" contextual entre blocos (ou inserir após o selecionado) + item "Duplicar" em BlockControls.

### A3 — Conteúdo filler vai ao ar; sem checklist de completude · `M`

- `blockFactory` nasce com copy de exemplo **como conteúdo real** (`blockFactory.ts:38` "Escreva sua mensagem aqui...", `:133` "Para quem ilumina meus dias", `:203` "Quer namorar comigo?"). `previewFilter` só remove vazio → texto padrão publica se o usuário esquecer.
- Templates usam fotos **hotlinked do Unsplash** (`templates.ts:57,83-91` etc.): imagens de terceiros na carta publicada — risco de link quebrado, licenciamento, e "fotos de modelo" num produto emocional.
- Não há verificação pré-publish ("2 polaroids sem foto", "texto padrão não editado") — exatamente o "modo de conferência" que o plano §6.2 já prevê.
**Correção**: marcar props default (`isPlaceholder` ou diff vs factory), checklist de completude no CTA de publicar, migrar assets de template para assets próprios.

### A4 — Status inicial `'published'` para página existente pode republicar sem pagamento · `B`

`useState<PageStatus>(pageIdFromRoute ? 'published' : 'draft')` (`Editor.tsx:438`). `buildLocalSnapshot` usa esse valor possivelmente-stale (`:271-279`); se o usuário escolher "Continuar rascunho local", `applyLocalDraft` grava `status='published'` (`:545-553`) → autosave envia `status:'published'` e o backend **aceita sem checar pagamento** (`page.service.ts:151-174` — `resolvePageLifecycle` aplica `publishedAt`). Não vaza ao público (`canAccessPage` exige `paid`, `:66-91`), mas grava estado inconsistente + `publishedAt` indevido.
**Correção**: status inicial `undefined`/do backend; não inferir `'published'`.

### A5 — Toolbar muda de lugar no scroll (alvo móvel sobre o conteúdo) · `M`

`window.scrollY > 120` transforma a toolbar horizontal do topo em dock vertical flutuante na **esquerda** (`EditorToolbar.tsx:727-729,824-826`); no mobile é dock fixo na **direita**. O botão "+" nunca está num lugar estável; menus abrem em direções distintas por contexto (`menuPlacement` down/left, `:1058`). Em edição longa (refinamento de página gerada = sessões mais longas e mais scroll), o controle mais usado se move sob o cursor. O dock mobile ainda cobre conteúdo na borda direita.
**Correção**: um lugar só — dock fixo consistente (ou toolbar sticky), sem morph de posição.

### A6 — Telemetria do editor não sai do console · `B`

`trackEditorEvent` faz apenas `console.info` (`services/telemetry.ts:31`). Eventos existem (`editor_open`, `load_*`, `save_*`, `publish_*`) mas não são coletados — impossível medir funil/drop-off, e a Fatia 0 exige baseline de métricas.
**Correção**: ligar ao endpoint de analytics (backend já tem `analytics.service.ts`).

### A7 — Mobile: heurísticas inconsistentes + edição degradada · `A`

- Canvas desliga DnD por `pointer: coarse` (`EditorCanvas.tsx:42-69,474`); toolbar vira dock por `max-width:1024px` (`EditorToolbar.tsx:717`). Dois "mobile" diferentes: laptop touch perde drag; janela desktop estreita ganha dock mobile com drag habilitado em área apertada.
- No touch, reordenação é só por botões ↑/↓ — sem modo "mover" explícito, sem undo (F5) para o erro de toque.
- Plano §6.2 já reconhece: "edição touch é o problema mais difícil" — grid+resize no touch exige design dedicado; hoje nem a stack linear está confortável.

---

## 4. Achados MÉDIOS

| # | Issue | Ref | Esforço |
|---|---|---|---|
| M1 | **409 descarta trabalho local sem backup** — "Recarregar servidor" (`Editor.tsx:885-896` → `handleLoadServerVersion` :503-533) sobrescreve tudo; não há "manter minha versão"/merge/cópia do draft. | `Editor.tsx:629-642` | M |
| M2 | **`MediaField multiple` envia só o 1º arquivo** — `queue` montada mas só `queue[0]` sobe (`MediaField.tsx:185-200`). Latente: nenhum bloco passa `multiple` hoje. | `MediaField.tsx:186-198` | B |
| M3 | **Timer sem live preview em edição** — modo edit é só formulário; usuário não vê o contador renderizado (`TimerBlock.tsx:125-180` vs preview :197-221). | `TimerBlock.tsx:125` | B |
| M4 | **`previewFilter` inconsistente** — polaroid exige só `photos.length>0` → polaroid nova (2 fotos `src:''`, `blockFactory.ts:220-233`) renderiza molduras vazias no preview/publicado; image exige src, gallery exige src válido. | `previewFilter.ts:20-33` | B |
| M5 | **Modal sem focus trap** — `role=dialog` mas não move/trava foco nem o restaura; backdrop-click fecha até o modal de delete (`Modal.tsx:33-65`, uso em `EditorCanvas.tsx:646`). | `Modal.tsx` | M |
| M6 | **Controles de bloco colidem com o conteúdo** — barra de ~50px em `top-0 -translate-y-1/2` (`BlockControls.tsx:71-72`) cobre a borda do bloco e o rodapé do anterior; só aparece em hover/seleção (`:53`). Limite 30 blocos falha **silencioso** (`editorStore.ts:185-187`): "+" desabilita sem explicar — única pista é o contador "30/30". | `BlockControls.tsx`, `editorStore.ts:185` | B |
| M7 | **Autosave remoto não flusha em saída** — debounce 3s (`types.ts:204`); sair antes perde o save remoto (local persiste → gera conflito "rascunho mais novo" fantasma na próxima sessão). | `Editor.tsx:397-405` | B |
| M8 | **UI duplicada** — status de save 2× (pill `Editor.tsx:858-870` + toolbar `EditorToolbar.tsx:658-681`); "Minhas Cartas" 2× (`Editor.tsx:836-842` + `EditorToolbar.tsx:636-654`); CTA publicar 2× (toolbar + botãozão `Editor.tsx:991-1029`). | — | B |
| M9 | **`execCommand` deprecated** no TextBlock (`TextBlock.tsx:471`) + commit só no blur (`:445-457`); highlight usa DOM-surgery própria (`:503-539`) — dois modelos de edição no mesmo bloco. | `TextBlock.tsx` | M–A |
| M10 | **Feedback de erro auto-dispensa em 4s** — `useFeedbackAutoDismiss` aplica a TODOS os feedbacks, inclusive erros de save/409 (`Editor.tsx:138-150`); erro deveria persistir até ação. | `Editor.tsx:138` | B |

---

## 5. Achados BAIXOS

| # | Issue | Ref |
|---|---|---|
| B1 | Só 4 templates; thumbnails e fotos internas hotlinked do Unsplash. | `templates.ts`, `Create.tsx:120-124` |
| B2 | `?template=` ignorado silenciosamente em página existente (`Editor.tsx:195` early-return com pageId). | `Editor.tsx:195` |
| B3 | Linguagem de dev exposta ao usuário: "Asset a1b2c3 \| status: ready" (`MediaField.tsx:541-558`). | `MediaField.tsx` |
| B4 | **Emojis na UI violam AGENTS.md §2**: `✨` em "Botão 'Não' fujão" (`QuizBlock.tsx:306`) e `❤️` no fallback de `successMessage` (`QuizBlock.tsx:122`). | `QuizBlock.tsx` |
| B5 | Temas dark no catálogo (`midnight-galaxy`, `cozy-candlelight`, `cyber-love`, `dark-aesthetic` — `themes.ts:76-93,152-207`) contradizem "STRICT LIGHT THEME" do AGENTS.md — ou a regra está desatualizada (mood "Noite Estrelada" da persona é dark por design, `colorHarmonizer`). Diretriz a resolver. | `themes.ts` |
| B6 | `isOpen`/`isRevealed` são props serializáveis; hoje a interação usa estado local (`EnvelopeBlock.tsx:118`, `ScratchBlock.tsx:236`) — bom; mas basta uma mutação futura para publicar "já revelado". | tipos `types.ts:106,114` |
| B7 | A11y: `AddMenu` tem `role=menu` mas sem navegação por setas (só `ThemeMenu` tem, `EditorToolbar.tsx:392-406`); reorder por teclado existe via `KeyboardSensor` (`EditorCanvas.tsx:489-492`) mas é indescoberto — plano §6.2 pede affordance explícita; `contenteditable` sem `aria-label` claro. | `EditorToolbar.tsx`, `EditorCanvas.tsx` |
| B8 | Labels compactos crípticos no dock: "Auto", "—", "..." (`EditorToolbar.tsx:678-680`). | `EditorToolbar.tsx` |
| B9 | `useSaveStateAutoReset` apaga "Tudo salvo" em 2.2s (`Editor.tsx:152-166`) — rápido demais para quem precisa de reasseguramento. | `Editor.tsx` |

---

## 6. O que já é bom — preservar

1. **Blocos nascem com conteúdo, não forms vazios** (`blockFactory.ts`) — é a "geração pobre mas presente": o modelo mental "editar é ajustar" já está no código e alinha com "começar pelo exemplo" (plano §7.1). O passo seguinte é só trocar filler por conteúdo gerado — e marcar o que é placeholder (A3).
2. **Edição inline WYSIWYG do QuizBlock** (`QuizBlock.tsx:218-260`): inputs dentro dos próprios botões/card — o melhor padrão de edição do sistema; exportar a ideia para os demais blocos em vez de forms genéricos abaixo.
3. **Collapse/expand com preview resumido** (`CollapsedPreview`, `EditorCanvas.tsx:88-245`) — progressive disclosure que escala para páginas geradas longas (30 blocos).
4. **DnD maduro**: handle explícito (`BlockControls.tsx:73-87`), `KeyboardSensor` + `sortableKeyboardCoordinates`, constraint de 6px (`EditorCanvas.tsx:483-492`), `DragOverlay` com preview real do bloco (`:632-642`).
5. **Draft local com resolução de precedência** (`draftPrecedence.ts`) + modal ask-user — fundação correta (o problema é o slot único, F3, não a lógica).
6. **Optimistic locking end-to-end**: `expectedVersion`/`If-Match` → 409 `PAGE_VERSION_CONFLICT` (`page.service.ts:137-146`, `pageService.ts:82-84`, `Editor.tsx:629-642`).
7. **MediaField**: upload presignado + polling de processamento (3s, visibility-aware) + estados sending/processing/ready/error + drag&drop + URL manual progressiva + reprocessar (`MediaField.tsx`) — o subsistema mais maduro do editor. `EditorInputSection` padroniza campos com `min-h-11` (44px).
8. **Feature flags end-to-end**: rollout por hash de userId no frontend (`featureFlags.ts:77-86`) + código `EDITOR_MODULAR_FEATURE_DISABLED` do backend com redirect gracioso (`Editor.tsx:310-323`) — já é a infra para lançar o editor novo por rollout.
9. **A11y parcial real**: `useReducedMotion` respeitado em canvas/toolbar, `aria-live` nos status, targets 44px consistentes, skeletons por rota, Escape desfaz seleção, Delete/Backspace protegidos por `isEditableTarget` (`EditorCanvas.tsx:34-40,548-570`).
10. **Lazy loading por bloco** (`BlockRenderer.tsx:8-46`) com `BlockSkeleton` — páginas pesadas não travam o mount.
11. **Estado de interação não serializa**: envelope/scratch/quiz usam estado local p/ reveal (`EnvelopeBlock.tsx:118`, `ScratchBlock.tsx:236`, `QuizBlock.tsx:66`) — destinatário sempre recebe estado inicial.
12. **Error boundary por rota** + fallback de bloco desconhecido (`BlockRenderer.tsx:68-74`).

---

## 7. Serialização hoje — estado para sections+grid (Fatia 3 / S6)

Modelo atual (`types.ts:163-183`): `Block = {id, type, version, props, meta{createdAt, updatedAt}}` — **lista plana ordenada**, sem `sectionId`, `rect` ou campos de layout. `Page = {id, blocks[], theme?, status, visibility, publishedAt, version}`.

**Dois pipelines destrutivos entre o usuário e o disco:**

```
save: editorStore → pageService.savePage → backend sanitizePageContent
        (page.sanitizer.ts:314-328 → migratePage + sanitizeBlock por whitelist)
load: backend toPageResponse → page.migration.ts:306-318 → frontend mapBackendPage
        → frontend migration.ts:440-449 (migrateBlock reconstrói só campos conhecidos)
```

Implicações diretas para `{col,row,w,h}` + `sectionId` (D1, `generation.contract.ts:132-157`):

1. **Campos novos morrem nas duas pontas.** `migrateBlock` frontend (`migration.ts:227-438`) e `sanitizeBlock` backend (`page.migration.ts:284-304`) retornam apenas `{id,type,version,props,meta}` — `rect`, `sectionId`, `style` seriam apagados no save **e** no load até as duas camadas serem atualizadas. Deploy precisa ser coordenado ou flagado (a infra de flag já existe — ver item 8 de §6).
2. **Forward-compat fraca.** Tipo desconhecido → `'text'` silencioso (frontend `migration.ts:79-98`; backend `page.migration.ts:157-163`). PageSpec já prevê 8 tipos não persistidos (`bouquet`, `photoBook`, `ticketRsvp`, `hints`, `intimacyGate`, `memoryCard`, `hiddenNotes`, `togetherCounter`, `youtube` — `generation.contract.ts:96-117`): qualquer cliente antigo carregando página nova rebaixa os módulos a texto. O `generate/README.md` já codifica isso como "checklist de 9 passos" — vale promover a erro/log em vez de downgrade mudo.
3. **Props também são podadas por whitelist** — F1 é o precedente vivo: o contrato `TextBlockProps` do frontend tem 12 campos, o backend aceita 2. O registry de blocos precisa ser a fonte única (ou testada por round-trip) para que `PageSpec→Block[]` não degrade no primeiro save.
4. **`version` existe mas nunca ramifica** — `BLOCK_VERSION=1`/`PAGE_VERSION=1` desde sempre (`types.ts:201-202`, `page.constants.ts:4-5`); ambas as migrations normalizam-para-o-modelo-atual sem ler `version`. A migração blocks-planos→sections será o primeiro uso real — bom momento para começar a honrar o campo.
5. **Limites a reavaliar**: `MAX_BLOCKS=30` (`types.ts:200`, `page.constants.ts:1`) conta módulos, não seções — página gerada com 12 seções de módulos pequenos pode estourar; `MAX_PAGE_BYTES=500k` (`page.sanitizer.ts:322-325`, erro `PAGE_TOO_LARGE`); `MAX_GALLERY_ITEMS=10` backend vs galeria.
6. **Assinatura de autosave por `JSON.stringify`** (`Editor.tsx:94-106`) recomputada a cada update — adicionar `rect`/`sectionId` entra de graça (signature cobre `blocks` inteiro), mas o custo sobe com blocos maiores; considerar hash incremental.
7. **`assetId` validado como ObjectId** (`page.migration.ts:11`, `page.sanitizer.ts:64-75`) — ids fora do padrão são dropados; mídias referenciadas pelo brief gerativo precisam respeitar isso.

---

## 8. O que muda quando o editor vira refinamento

Contexto: pipeline `CreativeBrief → PageSpec(sections+grid) → Block[]` populando o editor (plano §3.1/§6), paywall pós-reveal (D4), público pode gerar sem login (§7).

### Problemas que a direção resolve ou atenua
- **Cold-start de conteúdo**: a página chega populada — a empty state (`EditorCanvas.tsx:604-614`) e a ansiedade do "Em branco" viram edge cases, não o fluxo principal. O padrão factory-com-copy (item 1 de §6) já provou o formato.
- **Descoberta de blocos**: o menu "+" de 11 tipos (`EditorToolbar.tsx:49-61`) deixa de ser o portão — conteúdo chega pronto; adicionar é secundário.
- **Escolha de template**: o momento/brief substitui a galeria de 4 templates (B1).
- **A3 parcialmente**: conteúdo gerado é real, não filler — mas continua valendo marcar "o que ainda está vazio" (checklist §6.2 do plano).

### Problemas que **pioram**
- **F1/F2 (sanitizer destrutivo)**: o pipeline vai *produzir* conteúdo estilizado (tipografia por `specTheme`, cores persona do brief `coresFavoritas`) que o save literalmente apaga. Degradação passa de "bug de nicho" a "toda página gerada degrada no primeiro save". **Bloqueia a Fatia 3.**
- **F3 (rascunho único)**: funil público sem login → múltiplas páginas anônimas no mesmo navegador colidem num slot só; rascunho pré-cadastro precisa de identidade própria até o magic link (padrão meupresente §7.1).
- **F4 (sem salvar)**: "gera grátis, paga pra publicar" (D4) torna ainda mais absurdo que a única persistência seja o CTA de pagamento — drafts precisam existir **antes** do paywall, com expiração (§7).
- **F5 (sem undo)**: refinamento = deletar/encolher/ajustar conteúdo que já nasceu bom. Errar uma deleção numa página gerada custa mais caro que numa montada à mão. Touch + grid (§6.2) sem undo é inviável.
- **A1 (preview ≠ recipiente)**: se o reveal é o produto, o gap editor-preview↔PageCard (unboxing obrigatório, tilt card, footer viral) vira o ponto onde a promessa se quebra.
- **A5/A7 (toolbar móvel + touch)**: sessões de refinamento de página longa = muito scroll; grid+resize por toque é declarado "o problema mais difícil do plano" — as heurísticas divergentes de hoje (coarse vs 1024px) vão multiplicar o problema.
- **Serialização (§7)**: sections/grid esbarram em `MAX_BLOCKS=30` por módulo, no poda-campos das duas migrations, e no downgrade `unknown→text` quando o registry crescer.
- **Conflitos novos**: regenerar bloco pela AI vs. edição manual do usuário no mesmo bloco — hoje não existe noção de "versão por bloco" (só `meta.updatedAt`); merge/diff por bloco vira requisito (hoje o 409 é página-inteira, M1).

### Recomendações em ordem (máxima alavancagem primeiro)
1. **F1+F2** — sincronizar whitelists do backend com os contratos reais do frontend + teste de round-trip por tipo (pré-requisito da Fatia 3). `M+B`
2. **F4** — criar página no primeiro save + botão "Salvar rascunho"; desacopla persistência do paywall. `M`
3. **F3** — drafts namespaced `ce_page_draft_<id>` + "Começar do zero" explícito. `M–A`
4. **A4** — status inicial não-inferido (`B`, inclui-se no item 2).
5. **F5** — undo mínimo (delete/reorder/update) — blocker para edição touch do §6.2. `A`
6. **A1** — preview "como destinatário" reusando fluxo do PageCard. `M`
7. **A6** — sink de telemetria (necessário p/ baseline da própria Fatia 0). `B`
8. **A3** — checklist de completude pré-publish (é o "modo de conferência" do §6.2). `M`
9. **A5** — estabilizar toolbar num lugar só antes de adicionar controles de grid. `M`
10. **A2** — inserção posicional + duplicar bloco (barato, alto uso no refinamento). `B`

---

*Relatório produzido por leitura estática de código — sem sessões com usuários. Os achados "onde o usuário trava" são inferidos da estrutura; a Fatia 0 prevê validação com 5+ sessões reais.*
