# Graph Report - correioelegante3  (2026-08-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1297 nodes · 1750 edges · 164 communities (99 shown, 65 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4268a933`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- page.migration.ts
- asset.service.ts
- auth.service.ts
- assetService.ts
- types.ts
- SiteAtmosphere.tsx
- compilerOptions
- payment.controller.ts
- compilerOptions
- router.tsx
- compilerOptions
- devDependencies
- validation.ts
- devDependencies
- HeroAnimation.tsx
- HeroClouds.tsx
- dependencies
- dependencies
- app.ts
- asset.controller.ts
- Editor.tsx
- backend/src/config/featureFlags.ts
- GalleryBlock.tsx
- page.routes.ts
- scripts
- scripts
- auth.ts
- devDependencies
- TimerBlock.tsx
- EditorCanvas.tsx
- EditorToolbar.tsx
- MediaField.tsx
- editorStore.ts
- themes.ts
- Auth.tsx
- Home.tsx
- auth.routes.ts
- AppError
- Layout.tsx
- trackEditorState.ts
- useMusicPlayback.ts
- useMusicVisualizer.ts
- BlockRenderer.tsx
- migration.ts
- vercel.json
- dependencies
- frontend/src/config/featureFlags.ts
- Profile
- backend/package.json
- playerWaveform.ts
- scripts
- VideoBlock.tsx
- templates.ts
- ErrorBoundary
- main.tsx
- getMusicPlayerUIMode.ts
- MusicBlock.tsx
- EditorInputSection.tsx
- normalizeMusicTracks.ts
- BlockControls.tsx
- BlockWrapper.tsx
- frontend/README.md
- frontend/package.json
- navigation.ts
- CardTilt3D
- MagneticButton
- Container.tsx
- ProblemSection.tsx
- Button.tsx
- MediaField.test.tsx
- Payment
- authStore.ts
- HeroVideo.tsx
- ScrollReveal.tsx
- TextSplit.tsx
- SocialProofSection.tsx
- Badge.tsx
- InlineAlert.tsx
- ImageBlock.tsx
- TextBlock.tsx
- previewFilter.ts
- useMousePosition.ts
- useParallax.ts
- pages/Card.tsx
- eslint
- globals
- @types/node
- typescript
- typescript-eslint
- providers.tsx
- CustomCursor.tsx
- ParallaxSection.tsx
- SectionReveal.tsx
- ErrorLayout.tsx
- ScrollSection.tsx
- FAQSection.tsx
- HowItWorksSection.tsx
- ProductPreviewSection.tsx
- ui/Card.tsx
- Input.tsx
- Modal.tsx
- SectionCard.tsx
- SettingRow.tsx
- TextArea.tsx
- BrokenAudioContext
- PageRenderer.tsx
- blockFactory.ts
- Contact.tsx
- Create.tsx
- Error500.tsx
- PageCard
- messageStore.ts
- frontend/tsconfig.json
- bcryptjs
- brace-expansion
- cors
- dotenv
- express
- express-rate-limit
- jsonwebtoken
- prisma
- stripe
- zod
- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities
- framer-motion
- gsap
- lenis
- lottie-react
- lucide-react
- react
- react-dom
- react-hook-form
- react-router-dom
- test/setup.ts

## God Nodes (most connected - your core abstractions)
1. `AppError` - 22 edges
2. `compilerOptions` - 22 edges
3. `compilerOptions` - 18 edges
4. `prisma` - 16 edges
5. `compilerOptions` - 16 edges
6. `generateAccessToken()` - 15 edges
7. `CloudinaryMediaProvider` - 13 edges
8. `scripts` - 13 edges
9. `scripts` - 12 edges
10. `MediaProvider` - 11 edges

## Surprising Connections (you probably didn't know these)
- `AssetListQuery` --references--> `AssetKind`  [EXTRACTED]
  backend/src/services/asset.service.ts → backend/src/contracts/asset.contract.ts
- `RequestUploadUrlInput` --references--> `AssetKind`  [EXTRACTED]
  backend/src/services/asset.service.ts → backend/src/contracts/asset.contract.ts
- `createMessage()` --calls--> `resolvePageLifecycle()`  [EXTRACTED]
  backend/src/services/message.service.ts → backend/src/contracts/page.contract.ts
- `enqueueAssetMediaJobs()` --calls--> `logAssetEvent()`  [EXTRACTED]
  backend/src/services/mediaJob.service.ts → backend/src/utils/observability.ts
- `processOnePendingJob()` --calls--> `logAssetEvent()`  [EXTRACTED]
  backend/src/services/mediaWorker.service.ts → backend/src/utils/observability.ts

## Import Cycles
- None detected.

## Communities (164 total, 65 thin omitted)

### Community 0 - "page.migration.ts"
Cohesion: 0.05
Nodes (64): canAccessPageByLifecycle(), isPageStatus(), isPageVisibility(), LifecycleLike, PAGE_STATUS_VALUES, PAGE_VISIBILITY_VALUES, PageLifecycleDto, pageLifecycleSchema (+56 more)

### Community 1 - "asset.service.ts"
Cohesion: 0.06
Nodes (39): ASSET_KIND_VALUES, AssetKind, assetKindSchema, AssetLimitRule, getFileExtension(), mediaPolicyByKind, MODERATION_STATUS_VALUES, PROCESSING_STATUS_VALUES (+31 more)

### Community 2 - "auth.service.ts"
Cohesion: 0.06
Nodes (43): app, LEGAL_DOCUMENT_VERSIONS, LegalDocumentType, server, deleteUser(), getConsentPayload(), loginUser(), mediaProvider (+35 more)

### Community 3 - "assetService.ts"
Cohesion: 0.05
Nodes (34): api, AssetKind, AssetModerationStatus, AssetProcessingStatus, assetService, AssetSummary, UploadFileFlowParams, UploadUrlPayload (+26 more)

### Community 4 - "types.ts"
Cohesion: 0.05
Nodes (36): DraftDecision, DraftSnapshot, LOCAL_DRAFT_PREFERENCE_PROMPT, ResolveDraftPrecedenceInput, ResolveDraftPrecedenceResult, AUTOSAVE_DEBOUNCE_MS, Block, BLOCK_VERSION (+28 more)

### Community 5 - "SiteAtmosphere.tsx"
Cohesion: 0.09
Nodes (30): _fns, FrameFn, scheduleRenderer(), _tick(), BackgroundField(), BOKEH_COLORS, BokehParticle, generateBokeh() (+22 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+20 more)

### Community 7 - "payment.controller.ts"
Cohesion: 0.12
Nodes (23): createPayment(), getPaymentStatus(), getPaymentStatusByResource(), getResourcePaymentStatus(), isWithinDays(), mercadopagoWebhookHandler(), PaymentResourceType, PaymentTarget (+15 more)

### Community 8 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, baseUrl, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module (+14 more)

### Community 9 - "router.tsx"
Cohesion: 0.09
Nodes (16): Auth, Card, Contact, Create, Editor, Error404, Error500, ErrorSession (+8 more)

### Community 10 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+14 more)

### Community 11 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, supertest, tsx, @types/bcryptjs, @types/cookie-parser, @types/cors, @types/express, @types/jsonwebtoken (+13 more)

### Community 12 - "validation.ts"
Cohesion: 0.10
Nodes (19): AssetCompleteInput, AssetListQueryInput, AssetReprocessInput, AssetUploadUrlInput, blockMetaSchema, blockSchema, ChangePasswordInput, changePasswordSchema (+11 more)

### Community 13 - "devDependencies"
Cohesion: 0.11
Nodes (19): @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, jsdom (+11 more)

### Community 14 - "HeroAnimation.tsx"
Cohesion: 0.13
Nodes (10): ALL_TRAIL_HEARTS, BURST_PARTICLES, BurstParticle, BurstParticleConfig, Cloud, CLOUD_VARIANTS, getPhaseVisibility(), HeroAnimation() (+2 more)

### Community 15 - "HeroClouds.tsx"
Cohesion: 0.14
Nodes (11): CloudConfig, CloudLayer, clouds, generateStars(), HeroClouds(), HeroCloudsProps, MOBILE_CLOUD_INDICES, mobileClouds (+3 more)

### Community 16 - "dependencies"
Cohesion: 0.13
Nodes (15): axios, dependencies, axios, @hookform/resolvers, qrcode.react, tailwindcss, @tailwindcss/vite, zod (+7 more)

### Community 17 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, cookie-parser, helmet, mercadopago, multer, @prisma/client, smol-toml, @vercel/node (+7 more)

### Community 18 - "app.ts"
Cohesion: 0.19
Nodes (11): validate(), validateObjectId(), router, router, router, router, router, router (+3 more)

### Community 19 - "asset.controller.ts"
Cohesion: 0.25
Nodes (13): assetService, completeAssetUpload(), deleteAsset(), getAsset(), listAssets(), pickParam(), reprocessAsset(), requestAssetUploadUrl() (+5 more)

### Community 20 - "Editor.tsx"
Cohesion: 0.21
Nodes (14): buildLocalSnapshot(), DraftConflictState, Editor(), LocalDraftSnapshot, PageMetaState, SaveState, TemplateConflictState, toDraftSnapshot() (+6 more)

### Community 21 - "backend/src/config/featureFlags.ts"
Cohesion: 0.23
Nodes (9): EditorFlagDecision, featureFlags, hashToBucket(), resolveEditorAccessForUser(), resolveEditorMediaUploadAccessForUser(), resolveFlagAccessForUser(), AuthRequest, requireEditorFeature() (+1 more)

### Community 22 - "GalleryBlock.tsx"
Cohesion: 0.24
Nodes (11): BatchUploadState, GalleryBlock, GalleryBlockComponent(), GalleryBatchUploadFailure, GalleryBatchUploadResult, MAX_GALLERY_IMAGES, normalizeGalleryItems(), SyncedGalleryMedia (+3 more)

### Community 23 - "page.routes.ts"
Cohesion: 0.31
Nodes (10): createPage(), deletePage(), getPage(), getPages(), parseIfMatchHeader(), updatePage(), writePageRateLimiter, AssetEventPayload (+2 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, all, build, dev, graphify, lint, lint:backend, lint:frontend (+5 more)

### Community 25 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, lint, prisma:generate, prisma:migrate, prisma:studio, start (+4 more)

### Community 26 - "auth.ts"
Cohesion: 0.32
Nodes (9): createMessage(), deleteMessage(), getMessage(), getMessages(), getPublicCard(), authenticate(), optionalAuthenticate(), verifyAccessToken() (+1 more)

### Community 27 - "devDependencies"
Cohesion: 0.17
Nodes (11): concurrently, @ffprobe-installer/ffprobe, ffmpeg-static, rollup-plugin-visualizer, devDependencies, concurrently, ffmpeg-static, @ffprobe-installer/ffprobe (+3 more)

### Community 28 - "TimerBlock.tsx"
Cohesion: 0.27
Nodes (10): addMonths(), addYears(), diffTimerParts(), pad(), parseTargetDate(), TimerBlock, TimerBlockComponent(), TimerParts (+2 more)

### Community 29 - "EditorCanvas.tsx"
Cohesion: 0.24
Nodes (11): CanvasBlock, CanvasBlockComponent(), CanvasBlockProps, CollapsedPreview(), CollapsedPreviewProps, EditorCanvas(), formatTimerPreviewDate(), isEditableTarget() (+3 more)

### Community 30 - "EditorToolbar.tsx"
Cohesion: 0.20
Nodes (8): AddBlockOption, addBlockOptions, AvailableBlockType, EditorToolbar(), EditorToolbarProps, ToolbarControlsProps, useLayoutBehavior(), useToolbarMenus()

### Community 31 - "MediaField.tsx"
Cohesion: 0.26
Nodes (11): deriveSectionState(), getDefaultAccept(), isValidUrl(), MediaField(), MediaFieldProps, MediaFieldValue, MediaUploadState, toFriendlyUploadErrorMessage() (+3 more)

### Community 32 - "editorStore.ts"
Cohesion: 0.23
Nodes (11): createDebouncedStateStorage(), EditorStore, EditorStoreActions, EditorStoreState, initialEditorState, moveBlockByOffset(), noopStateStorage, nowIsoString() (+3 more)

### Community 33 - "themes.ts"
Cohesion: 0.26
Nodes (11): buildThemeStyle(), DEFAULT_THEME_ID, findThemeById(), getThemeById(), resolveThemeId(), resolveThemeVariable(), Theme, themeAliases (+3 more)

### Community 34 - "Auth.tsx"
Cohesion: 0.23
Nodes (11): ApiErrorResponse, Auth(), handleLogin(), handleRegister(), AuthApiErrorCode, getApiErrorCode(), getApiErrorMessage(), LoginForm (+3 more)

### Community 35 - "Home.tsx"
Cohesion: 0.17
Nodes (7): FAQSection, FinalCTASection, HowItWorksSection, LazyHeroAnimation, ProblemSection, ProductPreviewSection, SocialProofSection

### Community 36 - "auth.routes.ts"
Cohesion: 0.38
Nodes (9): changePassword(), deleteAccount(), exportAccountData(), login(), logout(), me(), refresh(), register() (+1 more)

### Community 37 - "AppError"
Cohesion: 0.33
Nodes (6): uploadMessageMedia(), errorHandler(), setMediaUrl(), ensureCloudinaryConfigured(), uploadMedia(), AppError

### Community 38 - "Layout.tsx"
Cohesion: 0.24
Nodes (5): Footer(), Header(), navLinks, SmoothScroll(), SmoothScrollProps

### Community 39 - "trackEditorState.ts"
Cohesion: 0.33
Nodes (10): addTrack(), clampEditorTrackIndex(), createEmptyTrack(), moveTrack(), normalizeOptionalText(), normalizeText(), removeTrack(), syncLegacyMirror() (+2 more)

### Community 40 - "useMusicPlayback.ts"
Cohesion: 0.31
Nodes (8): clampTrackIndex(), getAdjacentTrackIndex(), getShuffledTrackIndex(), PlaybackState, resolveNextTrackIndex(), resolveSelectedTrackIndex(), shouldAutoPlayOnTrackChange(), useMusicPlayback()

### Community 41 - "useMusicVisualizer.ts"
Cohesion: 0.27
Nodes (10): AudioContextCtor, createDefaultBars(), createFallbackBars(), getAudioContextCtor(), setupVisualizerGraph(), useMusicVisualizer(), UseMusicVisualizerParams, VisualizerGraphFallback (+2 more)

### Community 42 - "BlockRenderer.tsx"
Cohesion: 0.22
Nodes (9): blockMap, BlockRenderer, BlockRendererComponent(), BlockRendererProps, GalleryBlock, MusicBlock, renderFallback(), renderLoadingFallback() (+1 more)

### Community 43 - "migration.ts"
Cohesion: 0.45
Nodes (10): asBlockType(), asGalleryItems(), asMusicTracks(), asOptionalText(), asRecord(), asText(), asTimestamp(), migrateBlock() (+2 more)

### Community 44 - "vercel.json"
Cohesion: 0.18
Nodes (10): maxDuration, memory, buildCommand, functions, api/index.ts, installCommand, outputDirectory, rewrites (+2 more)

### Community 45 - "dependencies"
Cohesion: 0.20
Nodes (10): cloudinary, @vercel/speed-insights, web-vitals, dependencies, cloudinary, @vercel/speed-insights, web-vitals, cloudinary (+2 more)

### Community 46 - "frontend/src/config/featureFlags.ts"
Cohesion: 0.27
Nodes (6): EditorFlagDecision, featureFlags, hashToBucket(), resolveEditorAccessForUser(), resolveEditorMediaUploadAccessForUser(), loadFlagsModule()

### Community 48 - "backend/package.json"
Cohesion: 0.22
Nodes (8): name, overrides, minimatch, path-to-regexp, smol-toml, undici, private, version

### Community 49 - "playerWaveform.ts"
Cohesion: 0.22
Nodes (3): DESKTOP_WAVEFORM_BARS, MOBILE_WAVEFORM_BARS, WaveformBarModel

### Community 50 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, e2e:smoke, lint, preview, test, typecheck

### Community 51 - "VideoBlock.tsx"
Cohesion: 0.32
Nodes (5): AssetSelectProps, formatTime(), isValidVideoUrl(), VideoBlock, VideoBlockComponent()

### Community 52 - "templates.ts"
Cohesion: 0.32
Nodes (6): cloneBlockProps(), cloneTemplateBlocks(), generateBlockId(), Template, TemplateCategory, templates

### Community 53 - "ErrorBoundary"
Cohesion: 0.29
Nodes (3): ErrorBoundary, Props, State

### Community 54 - "main.tsx"
Cohesion: 0.33
Nodes (3): BootLoadingGate(), faviconCleanup, HEARTBEAT_FRAMES

### Community 55 - "getMusicPlayerUIMode.ts"
Cohesion: 0.38
Nodes (6): getMusicPlayerUIMode(), MUSIC_PLAYER_HAS_AUTOPLAY_TOGGLE, MUSIC_PLAYER_HAS_SHUFFLE_TOGGLE, MusicPlayerUIMode, shouldShowPlaylistControls(), shouldShowShuffleControl()

### Community 56 - "MusicBlock.tsx"
Cohesion: 0.38
Nodes (5): EMPTY_TRACKS, formatTime(), MusicBlock, MusicBlockComponent(), resolveWaveformHeights()

### Community 57 - "EditorInputSection.tsx"
Cohesion: 0.33
Nodes (6): EDITOR_FIELD_BASE_CLASS, EDITOR_FIELD_LABEL_CLASS, EditorInputSection(), EditorInputSectionProps, resolveStateClasses(), SectionState

### Community 58 - "normalizeMusicTracks.ts"
Cohesion: 0.60
Nodes (5): isPlayableHttpUrl(), normalizeMusicTracks(), normalizeTrack(), RuntimeMusicTrack, withLegacyMirrorFallback()

### Community 59 - "BlockControls.tsx"
Cohesion: 0.33
Nodes (3): BlockControls, BlockControlsProps, blockTypeLabels

### Community 60 - "BlockWrapper.tsx"
Cohesion: 0.33
Nodes (3): BlockWrapper, BlockWrapperProps, SortableHandleProps

### Community 62 - "frontend/package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 66 - "Container.tsx"
Cohesion: 0.40
Nodes (3): ContainerProps, ContainerSize, sizeClasses

### Community 68 - "Button.tsx"
Cohesion: 0.40
Nodes (4): Button, ButtonProps, sizes, variants

### Community 71 - "authStore.ts"
Cohesion: 0.50
Nodes (4): AuthState, useAuthStore, User, withTimeout()

### Community 72 - "HeroVideo.tsx"
Cohesion: 0.67
Nodes (3): frameUrl(), HeroVideo(), HeroVideoProps

### Community 80 - "previewFilter.ts"
Cohesion: 0.83
Nodes (3): filterPreviewBlocks(), hasContent(), shouldRenderPreviewBlock()

### Community 84 - "eslint"
Cohesion: 0.67
Nodes (3): eslint, eslint, eslint

### Community 85 - "globals"
Cohesion: 0.67
Nodes (3): globals, globals, globals

### Community 86 - "@types/node"
Cohesion: 0.67
Nodes (3): @types/node, @types/node, @types/node

### Community 87 - "typescript"
Cohesion: 0.67
Nodes (3): typescript, typescript, typescript

### Community 88 - "typescript-eslint"
Cohesion: 0.67
Nodes (3): typescript-eslint, typescript-eslint, typescript-eslint

## Knowledge Gaps
- **492 isolated node(s):** `LifecycleLike`, `PageLifecycleDto`, `GalleryItem`, `UnknownRecord`, `GalleryItem` (+487 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `backend/package.json`, `eslint`, `globals`, `@types/node`, `typescript`, `typescript-eslint`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `eslint`, `globals`, `@types/node`, `typescript`, `typescript-eslint`, `devDependencies`, `frontend/package.json`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `lenis`, `lottie-react`, `lucide-react`, `react`, `react-dom`, `react-hook-form`, `react-router-dom`, `dependencies`, `frontend/package.json`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `framer-motion`, `gsap`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `LifecycleLike`, `PageLifecycleDto`, `GalleryItem` to the rest of the system?**
  _492 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `page.migration.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05257312106627175 - nodes in this community are weakly interconnected._
- **Should `asset.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05673076923076923 - nodes in this community are weakly interconnected._
- **Should `auth.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05888376856118792 - nodes in this community are weakly interconnected._