# Editor Modular v2 - Plano de Expansao (Templates, Midia, Animacoes e Consistencia)

> Documento vivo para a segunda onda de features.
> Foco: experiencia visual premium, uploads nativos de midia e consistencia de produto.
> Ultima atualizacao: 2026-03-20

---

## Indice

1. Visao e Objetivos
2. Escopo Macro
3. Ordem de Execucao Revisada (Templates/Temas no final)
4. Estado Atual e Gaps
5. Principios de Produto e Engenharia
6. Arquitetura Alvo v2
7. Modelo de Dados v2
8. Epic A - Templates Realmente Personalizados
9. Epic B - Upload Nativo de Midia (imagem, video, audio)
10. Epic C - Importacao por Link (incluindo YouTube -> MP3)
11. Epic D - Sistema de Animacoes e Transicoes
12. Epic E - Consistencia Visual (Perfil/Configuracoes)
13. Seguranca, Compliance e Moderacao
14. Performance e Orcamento Tecnico
15. Testes e Quality Gate v2
16. Rollout e Operacao
17. Telemetria e KPIs
18. Roadmap de Execucao (Fases)
19. Riscos Criticos e Mitigacoes
20. Checklist de Pronto por Epic
21. Decisoes em Aberto

---

## 1. Visao e Objetivos

### Visao

Transformar o produto em uma plataforma de paginas emocionais altamente customizaveis, com nivel de personalizacao visual e media comparavel a referencias como guns.lol, sem perder estabilidade, seguranca e performance.

### Objetivos principais

1. Entregar templates com identidades visuais realmente distintas (nao apenas troca de cor).
2. Permitir upload direto de imagem, video e audio com pipeline robusto.
3. Reduzir friccao de UX para adicionar audio (incluindo fluxo por links).
4. Elevar qualidade de motion (entradas, transicoes, microinteracoes) em paginas-chave.
5. Padronizar linguagem visual, com foco em perfil/configuracoes.

### Nao objetivos (nesta fase)

- Marketplace aberto de templates para terceiros.
- Editor visual "canvas livre" tipo Figma/Canva completo.
- Streaming de video ao vivo.

---

## 2. Escopo Macro

### Entram nesta onda

- Engine de templates premium com fundos interativos.
- Catalogo de templates mais profundo e versionado.
- Upload nativo de midia com processamento assincrono.
- Blocos de video/audio com UX moderna.
- Fluxo de importacao por link com politicas claras.
- Sistema de motion transversal no produto.
- Refino de design system e consistencia de telas de conta.

### Ficam para fase futura

- Editor de keyframes/animacoes avancadas por usuario.
- Loja de assets pagos.
- IA generativa de temas/fundos.

---

## 3. Ordem de Execucao Revisada (Templates/Temas no final)

### Decisao de sequenciamento

Como templates/temas premium exigem alto grau de curadoria manual e polimento humano, essa parte passa a ser a **ultima etapa funcional** da onda v2.

### Ordem oficial de implementacao

1. Discovery e guardrails (legal, infra, custos)
2. Fundacao de midia (upload + assets)
3. Video/audio avancado e processamento
4. Importacao por link (segura, com compliance)
5. Motion system global
6. Consistencia visual (perfil/configuracoes)
7. Templates/temas premium (polimento final manual)
8. Hardening, testes finais e rollout

### Impacto no plano

- Epic A (Templates Realmente Personalizados) continua no documento por completude tecnica.
- No roadmap de execucao, Epic A passa a ser executada ao final (antes de hardening/rollout).

---

## 4. Estado Atual e Gaps

### Ja existe

- Editor modular com blocos, preview, persistencia local e backend.
- Catalogo inicial de templates.
- Sistema de temas com CSS variables.
- Pipeline de pages com seguranca e versionamento.
- Quality gate e rollout com feature flags.

### Gaps para visao v2

- Templates ainda limitados a variacao leve.
- Falta upload nativo robusto de video/audio.
- Falta pipeline de transcode/thumbnail/waveform.
- Falta estrategia clara para importacao de links de musica.
- Motion inconsistente entre telas.
- Perfil/configuracoes com linguagem visual heterogenea.

---

## 5. Principios de Produto e Engenharia

1. **Visual impact first, com degradacao elegante.**
2. **Seguranca e compliance acima de conveniencia.**
3. **Upload resiliente e observavel.**
4. **Preview fiel ao publico.** O que o usuario ve no editor deve refletir no card publico.
5. **Progressive enhancement.** Efeitos pesados desligam em dispositivos fracos.
6. **Feature flags por epic.** Entregar incremental sem risco sistemico.

---

## 6. Arquitetura Alvo v2

```txt
Frontend
  editor/
    templates/        -> definicoes e variacoes de templates premium
    themes/           -> tokens de tema e mapeamentos
    backgrounds/      -> render de fundos (gradient, particles, video, shader-lite)
    blocks/           -> text, image, timer, gallery, music, video
    media/            -> uploader, progress, select de assets

Backend
  routes/
    pages.routes.ts
    assets.routes.ts
    media-import.routes.ts
  services/
    page.*
    asset.*
    mediaImport.*
  workers/
    transcode.worker.ts
    waveform.worker.ts
    moderation.worker.ts

Infra
  Object Storage (S3/R2/Cloudinary)
  Queue (BullMQ + Redis)
  FFmpeg workers
  CDN
```

### Componentes novos

- `Asset Service`: gerencia upload, metadados, lifecycle.
- `Transcode Worker`: gera versoes otimizadas de video/audio.
- `Media Import Service`: importa por link com regras de compliance.
- `Template Runtime v2`: aplica layout + background + motion profile.

---

## 7. Modelo de Dados v2

### 6.1 Novos tipos de dominio (conceito)

```ts
type AssetKind = 'image' | 'video' | 'audio'
type AssetSource = 'upload' | 'link-import'
type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed'
type ModerationStatus = 'pending' | 'approved' | 'rejected'

type BackgroundType = 'gradient' | 'particles' | 'video-loop' | 'parallax-image'

type TemplateDefinition = {
  id: string
  name: string
  category: 'romantic' | 'friendship' | 'secret' | 'classic' | 'bold' | 'minimal'
  version: number
  thumbnail: string
  scene: {
    background: BackgroundConfig
    layoutPreset: 'letter' | 'story' | 'spotlight' | 'timeline'
    motionProfile: 'none' | 'soft' | 'rich'
  }
  defaults: {
    themeId: string
    blocks: Block[]
  }
}

type BackgroundConfig = {
  type: BackgroundType
  intensity?: number
  assetId?: string
  options?: Record<string, unknown>
}
```

### 6.2 Prisma (proposta)

```prisma
model Asset {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  userId           String   @db.ObjectId
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  kind             String   // image | video | audio
  source           String   // upload | link-import
  sourceUrl        String?
  storageKey       String
  publicUrl        String?
  mimeType         String
  sizeBytes        Int
  width            Int?
  height           Int?
  durationMs       Int?
  waveform         Json?
  processingStatus String   @default("pending")
  moderationStatus String   @default("pending")
  errorCode        String?
  errorMessage     String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([userId, kind])
  @@index([processingStatus])
}

model Template {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  slug        String   @unique
  name        String
  category    String
  isActive    Boolean  @default(true)
  latestMajor Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  versions    TemplateVersion[]
}

model TemplateVersion {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  templateId  String   @db.ObjectId
  template    Template @relation(fields: [templateId], references: [id], onDelete: Cascade)
  major       Int
  minor       Int
  content     Json
  changelog   String?
  isStable    Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@unique([templateId, major, minor])
}
```

### 6.3 Evolucao do `Page.content`

Adicionar campos opcionais:

```ts
type PageContentV2 = {
  blocks: Block[]
  theme?: string
  version: number
  templateRef?: {
    templateId: string
    major: number
    minor: number
  }
  background?: BackgroundConfig
  motionProfile?: 'none' | 'soft' | 'rich'
}
```

---

## 8. Epic A - Templates Realmente Personalizados

> Objetivo: templates com visual de "universos" diferentes, e nao apenas combinacoes de cor/fonte.

### A.1 Produto

- Criar 6 familias visuais fortes:
  - Romantic Cinematic
  - Retro Letter
  - Neon Night
  - Minimal Poem
  - Nature Calm
  - Bold Pop

- Cada familia deve variar:
  - estrutura de layout
  - fundo
  - motion profile
  - tratamento tipografico

### A.2 Runtime de background

Suportar tipos:
- `gradient` (baixo custo)
- `particles` (canvas leve)
- `parallax-image` (interacao mouse/tilt)
- `video-loop` (mp4/webm otimizado)

Com fallback automatico:
- `prefers-reduced-motion` => reduz animacoes
- `pointer: coarse` => baixa intensidade
- FPS baixo => fallback para gradient

### A.3 Implementacao frontend

Arquivos alvo:

```txt
frontend/src/editor/templates/
  templateCatalog.ts
  templateRuntime.ts
  backgrounds/
    GradientBackground.tsx
    ParticlesBackground.tsx
    ParallaxBackground.tsx
    VideoLoopBackground.tsx
  layout/
    LetterLayout.tsx
    StoryLayout.tsx
    SpotlightLayout.tsx
```

### A.4 UX de selecao

- `/create` vira uma experiencia de descoberta:
  - filtro por categoria
  - preview animado curto
  - badge de "leve/medio/pesado" de performance
  - CTA "usar template"

### A.5 Regras tecnicas

- Template e declarativo (JSON), sem JSX persistido.
- Overrides do usuario devem ser preservados ao atualizar versao do template.
- Incluir `templateRef` no `Page.content` para rastreabilidade.

### A.6 Entregas

- 6 templates premium estaveis.
- Runtime de background com fallback.
- Migracao para `templateRef`.

---

## 9. Epic B - Upload Nativo de Midia

> Objetivo: permitir upload direto de imagem, video e audio com UX moderna e pipeline robusto.

### B.1 Fluxo de upload

1. Front solicita URL assinada (`POST /api/assets/upload-url`).
2. Front envia arquivo direto para storage/CDN.
3. Front confirma upload (`POST /api/assets/complete`).
4. Backend cria `Asset` com `processingStatus=pending`.
5. Worker processa (thumbnail, transcode, waveform).
6. Front recebe status em polling ou websocket.

### B.2 Tipos suportados

- Image: jpg, png, webp, avif
- Video: mp4, webm
- Audio: mp3, m4a, wav, ogg

### B.3 Limites iniciais

- Image: ate 10 MB
- Audio: ate 25 MB
- Video: ate 120 MB
- Duracao maxima video/audio: 10 min (fase inicial)

### B.4 Processamento

- Image: gerar webp otimizado + thumbnail.
- Video:
  - normalizar codec
  - gerar poster image
  - gerar variante "mobile"
- Audio:
  - normalizar bitrate (ex: 128 kbps)
  - gerar waveform JSON para player

### B.5 Backend API (proposta)

- `POST /api/assets/upload-url`
- `POST /api/assets/complete`
- `GET /api/assets/:id`
- `GET /api/assets?kind=image|video|audio`
- `DELETE /api/assets/:id`

### B.6 Frontend UX

- Uploader com drag-and-drop + click.
- Barra de progresso por arquivo.
- Estados claros: `enviando`, `processando`, `pronto`, `erro`.
- Biblioteca de midia do usuario para reutilizar assets.

### B.7 Integracao com blocos

- `ImageBlock` aceita `assetId` e URL externa.
- `MusicBlock` aceita `assetId` (audio processado).
- Novo `VideoBlock` aceita `assetId` + poster + controls.

### B.8 Seguranca

- Assinatura curta de upload URL.
- Validacao mime/size server-side.
- Ownership estrito por `userId`.

---

## 10. Epic C - Importacao por Link (incluindo YouTube -> MP3)

> Objetivo: reduzir friccao para adicionar audio, com estrategia legal e tecnica segura.

### C.1 Recomendacao de produto (ordem)

1. **Fase 1 (segura):** aceitar links embeddaveis e/ou upload direto.
2. **Fase 2 (condicional):** importacao/conversao apenas com gate legal explicito.

### C.2 Risco legal/compliance

Conversao automatica YouTube -> MP3 pode violar Termos de Uso e direitos autorais em varios contextos.

#### Regras obrigatorias antes de liberar

- Revisao juridica formal.
- Termo de responsabilidade do usuario (declaracao de direitos).
- Politica de takedown e abuse report.
- Log de origem e trilha de auditoria.

### C.3 Fluxo recomendado v1

- Campo "colar link" para audio/video suportado.
- Sistema detecta provider e oferece:
  - embed (quando permitido)
  - instrucoes para upload manual (fallback)

### C.4 Fluxo opcional v2 (se aprovado juridicamente)

- Endpoint: `POST /api/media-import/youtube-audio`
- Worker com ffmpeg/ytdlp:
  - baixa stream
  - extrai audio
  - normaliza formato
  - salva como `Asset(kind='audio', source='link-import')`

### C.5 Guardrails tecnicos

- Rate limit forte por usuario/IP.
- Filas isoladas para importacao de link.
- Timeout e limite de duracao.
- Bloqueio de dominios nao confiaveis.

### C.6 UX de importacao

- Passo 1: colar link.
- Passo 2: validacao de suporte.
- Passo 3: processamento com progresso.
- Passo 4: asset pronto no bloco.

---

## 11. Epic D - Sistema de Animacoes e Transicoes

> Objetivo: remover aberturas "estaticas" e dar fluidez consistente ao produto inteiro.

### D.1 Motion language

Definir tokens em arquivo central:

```ts
// frontend/src/design/motionTokens.ts
export const motion = {
  duration: {
    fast: 0.16,
    base: 0.24,
    slow: 0.42,
  },
  ease: {
    standard: [0.2, 0.8, 0.2, 1],
    enter: [0.16, 1, 0.3, 1],
  },
}
```

### D.2 Escopos prioritarios

1. Entradas de secoes principais (Home, Create, Editor header).
2. Transicao de rotas (fade + slight slide).
3. Estados vazios e feedback de acao.
4. Cards e listas em perfil/configuracoes.

### D.3 Boas praticas

- Nao animar tudo ao mesmo tempo.
- Priorizar 60fps.
- Respeitar `prefers-reduced-motion`.
- Evitar conflitos entre Framer Motion e GSAP no mesmo elemento.

### D.4 Entregas

- Biblioteca de presets (`fadeUp`, `staggerIn`, `scaleIn`).
- Padrao para modais/drawers/dropdowns.
- Remocao de transicoes bruscas de mount/unmount.

---

## 12. Epic E - Consistencia Visual (Perfil/Configuracoes)

> Objetivo: unificar linguagem visual e elevar confianca de produto em telas de conta.

### E.1 Auditoria de UI

- Mapear inconsistencias de:
  - espacamento
  - tipografia
  - hierarquia visual
  - botoes e estados
  - mensagens de erro/sucesso

### E.2 Design tokens

Consolidar em tokens unicos:
- spacing scale
- radius
- elevacao/sombras
- estados (success/warning/error/info)
- surfaces para cards/paineis

### E.3 Componentizacao

Padronizar componentes de conta:
- `SectionCard`
- `SettingRow`
- `EmptyState`
- `InlineAlert`
- `FormActions`

### E.4 Fluxos prioritarios

- Perfil: lista de paginas/cards do usuario com status claro.
- Configuracoes: preferencias e seguranca em layout uniforme.
- Historico de pagamentos/cartoes: consistencia de tabela/lista.

### E.5 Acessibilidade

- Contraste AA minimo.
- Focus ring consistente.
- Labels e mensagens de validacao semanticamente corretas.

---

## 13. Seguranca, Compliance e Moderacao

### 12.1 Uploads

- Validar tipo real do arquivo (nao confiar em extensao).
- Bloquear executaveis e payloads suspeitos.
- Antimalware scan (opcional inicial, recomendado para escala).

### 12.2 Conteudo sensivel

- Pipeline de moderacao para midia publica.
- Flags de conteudo + possibilidade de bloqueio por policy.

### 12.3 Legal de audio/video

- Termos claros sobre direitos autorais.
- Botao de report para conteudo indevido.
- Takedown process documentado.

---

## 14. Performance e Orcamento Tecnico

### Metas iniciais

- LCP < 2.5s (p75)
- CLS < 0.1
- INP < 200ms
- Editor FPS > 50 em dispositivo medio

### Regras tecnicas

- Lazy load de midia pesada.
- Preload apenas do necessario acima da dobra.
- Background interativo com degrade automatico.
- Cache de assets e thumbnails em CDN.

### Orcamento de bundle

- Editor route chunk target: < 180kb gzip (sem incluir media externa).
- Split por bloco pesado (Video/Music/Gallery).

---

## 15. Testes e Quality Gate v2

### Unit

- template runtime
- background resolvers
- media validators
- link import parser

### Integracao

- assets upload-url/complete
- processamento status
- ownership e acesso
- moderacao/rejeicao

### E2E (prioridade alta)

Fluxo critico:
1. `/create` -> seleciona template premium
2. `/editor` -> upload imagem/video/audio
3. salva pagina
4. abre `/editor/:id` e confirma persistencia
5. abre card publico e valida render

### CI gate adicional

- frontend lint + test + build
- backend test + build
- smoke e2e minimo em PR principal

---

## 16. Rollout e Operacao

### Feature flags sugeridas

- `editor_templates_v2_enabled`
- `editor_media_upload_enabled`
- `editor_video_block_enabled`
- `editor_link_import_enabled`
- `editor_motion_v2_enabled`

### Estrategia

1. Internal only
2. 5%
3. 20%
4. 50%
5. 100%

### Rollback

- Desligar flag sem deploy.
- Preservar dados (nao deletar assets/pages).
- Fallback para render estatico quando runtime rico falhar.

---

## 17. Telemetria e KPIs

### Eventos principais

- `template_preview_open`
- `template_apply_success`
- `asset_upload_start/success/error`
- `asset_processing_ready/failed`
- `editor_publish_success/error`
- `public_card_view`

### KPIs de produto

- Conversao create -> publish
- Tempo medio ate primeira pagina publicada
- Taxa de sucesso de upload por tipo
- Retencao D7 de usuarios que usam template premium
- Reuso de assets na biblioteca pessoal

### KPIs tecnicos

- Taxa de falha de transcode
- Tempo medio de processamento por tipo
- Erro 4xx/5xx em endpoints de assets/import

---

## 18. Roadmap de Execucao (Fases)

## Fase 0 - Discovery e Guardrails (1 semana)

- Revisao legal de importacao por link.
- Escolha final de storage/CDN/queue.
- Definicao de limites de arquivo e custo.

## Fase 1 - Fundacao de Midia (2 semanas)

- Asset model + API upload-url/complete.
- Biblioteca de midia no frontend.
- Integracao inicial em ImageBlock/MusicBlock.

## Fase 2 - Video/Audio avancado (2 semanas)

- VideoBlock completo.
- Player audio melhorado com waveform.
- Processamento de midia com workers.

## Fase 3 - Importacao por Link (1-2 semanas, condicional)

- Embed/link parser seguro.
- Conversao YouTube->MP3 somente se aprovado juridicamente.

## Fase 4 - Motion e Consistencia UI (2 semanas)

- Motion tokens e presets em telas-chave.
- Refino de perfil/configuracoes.

## Fase 5 - Templates Premium Runtime (2-3 semanas, com polimento manual)

- Engine de background interativo + fallback.
- 3 templates premium iniciais.
- Ajustes em `/create` para descoberta visual.
- Curadoria/polimento humano de copy, layout e identidade visual.

## Fase 6 - Hardening e Rollout (1 semana)

- Testes E2E finais.
- Rollout progressivo.
- Observabilidade e runbook.

---

## 19. Riscos Criticos e Mitigacoes

| Risco | Impacto | Mitigacao |
|------|---------|-----------|
| Conversao YouTube->MP3 gerar problema legal | Alto | Gate legal, termo de responsabilidade, opcao apenas embed/upload |
| Custo de storage/transcode crescer rapido | Alto | Limites por plano, compressao, TTL para assets nao usados |
| Queda de performance com fundos interativos | Medio/Alto | Fallback automatico, motion profile por device |
| UX confusa com muitos templates | Medio | Curadoria por categoria + preview claro |
| Inconsistencia entre editor e publico | Alto | Mesmo runtime de tema/background em ambos |

---

## 20. Checklist de Pronto por Epic

### Epic A - Templates Premium
- [ ] Runtime de background estavel
- [ ] 6 templates com identidade distinta
- [ ] Fallback mobile e reduced-motion
- [ ] Persistencia de `templateRef`

### Epic B - Upload Nativo
- [ ] Upload assinado funcionando
- [ ] Processamento de imagem/video/audio
- [ ] Biblioteca de assets no editor
- [ ] Ownership e seguranca validados

### Epic C - Link Import
- [ ] Parser de links suportados
- [ ] Gate legal implementado
- [ ] Fluxo de erro e fallback claro
- [ ] Conversao condicional (se aprovada)

### Epic D - Motion
- [ ] Tokens e presets centralizados
- [ ] Entradas/transicoes em telas chave
- [ ] Preferencia reduced-motion respeitada

### Epic E - Consistencia Visual
- [ ] Auditoria de inconsistencias concluida
- [ ] Perfil/configuracoes refatorados
- [ ] Componentes padronizados reutilizaveis

---

## 21. Decisoes em Aberto

1. Qual provedor de storage/transcode sera padrao (Cloudinary vs S3+FFmpeg)?
2. Conversao YouTube->MP3 sera liberada? Em quais paises/contextos?
3. Quais limites por plano (free/pago) para upload e duracao?
4. Quais templates entram no lancamento inicial de v2?
5. Qual destino da telemetria (Sentry, Datadog, PostHog)?

---

> Proximo update recomendado: ao fechar Fase 0 com decisoes de legal, infra e limites de custo.
