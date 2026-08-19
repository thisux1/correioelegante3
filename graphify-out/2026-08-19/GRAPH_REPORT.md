# Graph Report - correioelegante3  (2026-08-18)

## Corpus Check
- 203 files · ~349,386 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1323 nodes · 1769 edges · 147 communities (95 shown, 52 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Page Contract & Domain Services
- Page Contract & Domain Services
- Page Contract & Domain Services
- Dependency & Tooling Manifests
- Dependency & Tooling Manifests
- Page Contract & Domain Services
- Page Contract & Domain Services
- Dependency & Tooling Manifests
- Visual Atmosphere & Hero Animations
- TypeScript Compilation Configuration
- Asset & Media Upload Subsystem
- TypeScript Compilation Configuration
- TypeScript Compilation Configuration
- Payment Gateway & Webhook Flow
- Dependency & Tooling Manifests
- Page Contract & Domain Services
- Page Contract & Domain Services
- Visual Atmosphere & Hero Animations
- Visual Atmosphere & Hero Animations
- Asset & Media Upload Subsystem
- Authentication & Identity Management
- Page Contract & Domain Services
- Authentication & Identity Management
- Asset & Media Upload Subsystem
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Dependency & Tooling Manifests
- Authentication & Identity Management
- Page Contract & Domain Services
- Payment Gateway & Webhook Flow
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Page Contract & Domain Services
- Dependency & Tooling Manifests
- Asset & Media Upload Subsystem
- Asset & Media Upload Subsystem
- Asset & Media Upload Subsystem
- Module: Footer
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Page Contract & Domain Services
- Module: vercel.json
- Dependency & Tooling Manifests
- Module: featureFlags
- Page Contract & Domain Services
- Page Contract & Domain Services
- Card Editor & Draft Engine
- Module: BootLoadingGate
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Telemetry & Observability Infrastructure
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Module: navigation
- Visual Atmosphere & Hero Animations
- Visual Atmosphere & Hero Animations
- Module: Container
- Module: ProblemSection
- Module: Button
- Card Editor & Draft Engine
- Page Contract & Domain Services
- Authentication & Identity Management
- Visual Atmosphere & Hero Animations
- Visual Atmosphere & Hero Animations
- Visual Atmosphere & Hero Animations
- Module: SocialProofSection
- Module: Badge
- Module: InlineAlert
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Card Editor & Draft Engine
- Module: useMousePosition
- Module: useParallax
- Page Contract & Domain Services
- Module: providers
- Visual Atmosphere & Hero Animations
- Visual Atmosphere & Hero Animations
- Visual Atmosphere & Hero Animations
- Telemetry & Observability Infrastructure
- Module: ScrollSection
- Module: FAQSection
- Module: HowItWorksSection
- Module: ProductPreviewSection
- Module: Card
- Module: Input
- Module: Modal
- Module: SectionCard
- Module: SettingRow
- Module: TextArea
- Card Editor & Draft Engine
- Page Contract & Domain Services
- Card Editor & Draft Engine
- Page Contract & Domain Services
- Page Contract & Domain Services
- Page Contract & Domain Services
- Page Contract & Domain Services
- Module: messageStore
- TypeScript Compilation Configuration
- Dependency & Tooling Manifests
- Dependency & Tooling Manifests
- Dependency & Tooling Manifests
- Dependency & Tooling Manifests
- Dependency & Tooling Manifests
- Dependency & Tooling Manifests
- Dependency & Tooling Manifests
- Dependency & Tooling Manifests
- Dependency & Tooling Manifests
- Module: setup

## God Nodes (most connected - your core abstractions)
1. `AppError` - 22 edges
2. `compilerOptions` - 22 edges
3. `compilerOptions` - 18 edges
4. `prisma` - 16 edges
5. `compilerOptions` - 16 edges
6. `generateAccessToken()` - 15 edges
7. `CloudinaryMediaProvider` - 13 edges
8. `scripts` - 11 edges
9. `MediaProvider` - 11 edges
10. `logAssetEvent()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `makeToken()` --calls--> `generateAccessToken()`  [EXTRACTED]
  backend/src/__tests__/assets.test.ts → backend/src/utils/jwt.ts
- `makeToken()` --calls--> `generateAccessToken()`  [EXTRACTED]
  backend/src/__tests__/auth.test.ts → backend/src/utils/jwt.ts
- `makeToken()` --calls--> `generateAccessToken()`  [EXTRACTED]
  backend/src/__tests__/messages.test.ts → backend/src/utils/jwt.ts
- `makeToken()` --calls--> `generateAccessToken()`  [EXTRACTED]
  backend/src/__tests__/pages.test.ts → backend/src/utils/jwt.ts
- `makeToken()` --calls--> `generateAccessToken()`  [EXTRACTED]
  backend/src/__tests__/payment.test.ts → backend/src/utils/jwt.ts

## Import Cycles
- None detected.

## Communities (147 total, 52 thin omitted)

### Community 0 - "Page Contract & Domain Services"
Cohesion: 0.05
Nodes (64): canAccessPageByLifecycle(), isPageStatus(), isPageVisibility(), LifecycleLike, PAGE_STATUS_VALUES, PAGE_VISIBILITY_VALUES, PageLifecycleDto, pageLifecycleSchema (+56 more)

### Community 1 - "Page Contract & Domain Services"
Cohesion: 0.06
Nodes (42): app, LEGAL_DOCUMENT_VERSIONS, LegalDocumentType, server, deleteUser(), getConsentPayload(), loginUser(), mediaProvider (+34 more)

### Community 2 - "Page Contract & Domain Services"
Cohesion: 0.05
Nodes (34): api, AssetKind, AssetModerationStatus, AssetProcessingStatus, assetService, AssetSummary, UploadFileFlowParams, UploadUrlPayload (+26 more)

### Community 3 - "Dependency & Tooling Manifests"
Cohesion: 0.04
Nodes (44): @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+36 more)

### Community 4 - "Dependency & Tooling Manifests"
Cohesion: 0.05
Nodes (43): axios, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, dependencies, axios, @dnd-kit/core (+35 more)

### Community 5 - "Page Contract & Domain Services"
Cohesion: 0.05
Nodes (36): DraftDecision, DraftSnapshot, LOCAL_DRAFT_PREFERENCE_PROMPT, ResolveDraftPrecedenceInput, ResolveDraftPrecedenceResult, AUTOSAVE_DEBOUNCE_MS, Block, BLOCK_VERSION (+28 more)

### Community 6 - "Page Contract & Domain Services"
Cohesion: 0.05
Nodes (16): Auth, Card, Contact, Create, Editor, Error404, Error500, ErrorSession (+8 more)

### Community 7 - "Dependency & Tooling Manifests"
Cohesion: 0.05
Nodes (37): dependencies, bcryptjs, brace-expansion, cloudinary, cookie-parser, cors, dotenv, express (+29 more)

### Community 8 - "Visual Atmosphere & Hero Animations"
Cohesion: 0.09
Nodes (30): _fns, FrameFn, scheduleRenderer(), _tick(), BackgroundField(), BOKEH_COLORS, BokehParticle, generateBokeh() (+22 more)

### Community 9 - "TypeScript Compilation Configuration"
Cohesion: 0.07
Nodes (28): compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+20 more)

### Community 10 - "Asset & Media Upload Subsystem"
Cohesion: 0.16
Nodes (9): CloudinaryMediaProvider, getCloudinaryCredentialsFromUrl(), getRequiredEnv(), resolveCloudinaryResourceType(), CompleteUploadResult, CreateUploadUrlInput, CreateUploadUrlResult, MediaProvider (+1 more)

### Community 11 - "TypeScript Compilation Configuration"
Cohesion: 0.09
Nodes (22): compilerOptions, baseUrl, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module (+14 more)

### Community 12 - "TypeScript Compilation Configuration"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+14 more)

### Community 13 - "Payment Gateway & Webhook Flow"
Cohesion: 0.16
Nodes (17): createPayment(), getPaymentStatus(), getPaymentStatusByResource(), getResourcePaymentStatus(), isWithinDays(), mercadopagoWebhookHandler(), PaymentResourceType, PaymentTarget (+9 more)

### Community 14 - "Dependency & Tooling Manifests"
Cohesion: 0.11
Nodes (18): concurrently, @ffprobe-installer/ffprobe, dependencies, cloudinary, @vercel/speed-insights, web-vitals, devDependencies, concurrently (+10 more)

### Community 15 - "Page Contract & Domain Services"
Cohesion: 0.11
Nodes (7): FAQSection, FinalCTASection, HowItWorksSection, LazyHeroAnimation, ProblemSection, ProductPreviewSection, SocialProofSection

### Community 16 - "Page Contract & Domain Services"
Cohesion: 0.12
Nodes (15): AssetCompleteInput, AssetListQueryInput, assetListQuerySchema, AssetReprocessInput, AssetUploadUrlInput, blockMetaSchema, blockSchema, ChangePasswordInput (+7 more)

### Community 17 - "Visual Atmosphere & Hero Animations"
Cohesion: 0.13
Nodes (10): ALL_TRAIL_HEARTS, BURST_PARTICLES, BurstParticle, BurstParticleConfig, Cloud, CLOUD_VARIANTS, getPhaseVisibility(), HeroAnimation() (+2 more)

### Community 18 - "Visual Atmosphere & Hero Animations"
Cohesion: 0.14
Nodes (11): CloudConfig, CloudLayer, clouds, generateStars(), HeroClouds(), HeroCloudsProps, MOBILE_CLOUD_INDICES, mobileClouds (+3 more)

### Community 19 - "Asset & Media Upload Subsystem"
Cohesion: 0.25
Nodes (13): assetService, completeAssetUpload(), deleteAsset(), getAsset(), listAssets(), pickParam(), reprocessAsset(), requestAssetUploadUrl() (+5 more)

### Community 20 - "Authentication & Identity Management"
Cohesion: 0.24
Nodes (13): changePassword(), deleteAccount(), exportAccountData(), login(), logout(), me(), refresh(), register() (+5 more)

### Community 21 - "Page Contract & Domain Services"
Cohesion: 0.21
Nodes (14): buildLocalSnapshot(), DraftConflictState, Editor(), LocalDraftSnapshot, PageMetaState, SaveState, TemplateConflictState, toDraftSnapshot() (+6 more)

### Community 22 - "Authentication & Identity Management"
Cohesion: 0.23
Nodes (9): EditorFlagDecision, featureFlags, hashToBucket(), resolveEditorAccessForUser(), resolveEditorMediaUploadAccessForUser(), resolveFlagAccessForUser(), AuthRequest, requireEditorFeature() (+1 more)

### Community 23 - "Asset & Media Upload Subsystem"
Cohesion: 0.24
Nodes (8): uploadMessageMedia(), errorHandler(), router, upload, setMediaUrl(), ensureCloudinaryConfigured(), uploadMedia(), AppError

### Community 24 - "Card Editor & Draft Engine"
Cohesion: 0.24
Nodes (11): BatchUploadState, GalleryBlock, GalleryBlockComponent(), GalleryBatchUploadFailure, GalleryBatchUploadResult, MAX_GALLERY_IMAGES, normalizeGalleryItems(), SyncedGalleryMedia (+3 more)

### Community 25 - "Card Editor & Draft Engine"
Cohesion: 0.16
Nodes (9): blockMap, BlockRenderer, BlockRendererComponent(), BlockRendererProps, GalleryBlock, MusicBlock, renderFallback(), renderLoadingFallback() (+1 more)

### Community 26 - "Dependency & Tooling Manifests"
Cohesion: 0.15
Nodes (13): devDependencies, globals, @types/cookie-parser, @types/cors, @types/jsonwebtoken, @types/supertest, typescript, globals (+5 more)

### Community 27 - "Authentication & Identity Management"
Cohesion: 0.28
Nodes (10): createMessage(), deleteMessage(), getMessage(), getMessages(), getPublicCard(), authenticate(), optionalAuthenticate(), router (+2 more)

### Community 28 - "Page Contract & Domain Services"
Cohesion: 0.29
Nodes (11): createPage(), deletePage(), getPage(), getPages(), parseIfMatchHeader(), updatePage(), router, writePageRateLimiter (+3 more)

### Community 29 - "Payment Gateway & Webhook Flow"
Cohesion: 0.27
Nodes (12): createCardPayment(), createCardPaymentForResource(), getStripe(), handleWebhook(), markResourcePaymentPaid(), markResourcePaymentPending(), PaymentResourceType, PaymentTarget (+4 more)

### Community 30 - "Card Editor & Draft Engine"
Cohesion: 0.27
Nodes (10): addMonths(), addYears(), diffTimerParts(), pad(), parseTargetDate(), TimerBlock, TimerBlockComponent(), TimerParts (+2 more)

### Community 31 - "Card Editor & Draft Engine"
Cohesion: 0.24
Nodes (11): CanvasBlock, CanvasBlockComponent(), CanvasBlockProps, CollapsedPreview(), CollapsedPreviewProps, EditorCanvas(), formatTimerPreviewDate(), isEditableTarget() (+3 more)

### Community 32 - "Card Editor & Draft Engine"
Cohesion: 0.20
Nodes (8): AddBlockOption, addBlockOptions, AvailableBlockType, EditorToolbar(), EditorToolbarProps, ToolbarControlsProps, useLayoutBehavior(), useToolbarMenus()

### Community 33 - "Card Editor & Draft Engine"
Cohesion: 0.26
Nodes (11): deriveSectionState(), getDefaultAccept(), isValidUrl(), MediaField(), MediaFieldProps, MediaFieldValue, MediaUploadState, toFriendlyUploadErrorMessage() (+3 more)

### Community 34 - "Card Editor & Draft Engine"
Cohesion: 0.23
Nodes (11): createDebouncedStateStorage(), EditorStore, EditorStoreActions, EditorStoreState, initialEditorState, moveBlockByOffset(), noopStateStorage, nowIsoString() (+3 more)

### Community 35 - "Card Editor & Draft Engine"
Cohesion: 0.26
Nodes (11): buildThemeStyle(), DEFAULT_THEME_ID, findThemeById(), getThemeById(), resolveThemeId(), resolveThemeVariable(), Theme, themeAliases (+3 more)

### Community 36 - "Page Contract & Domain Services"
Cohesion: 0.23
Nodes (11): ApiErrorResponse, Auth(), handleLogin(), handleRegister(), AuthApiErrorCode, getApiErrorCode(), getApiErrorMessage(), LoginForm (+3 more)

### Community 37 - "Dependency & Tooling Manifests"
Cohesion: 0.18
Nodes (11): scripts, build, dev, lint, prisma:generate, prisma:migrate, prisma:studio, start (+3 more)

### Community 38 - "Asset & Media Upload Subsystem"
Cohesion: 0.20
Nodes (8): ASSET_KIND_VALUES, assetKindSchema, AssetLimitRule, getFileExtension(), mediaPolicyByKind, MODERATION_STATUS_VALUES, PROCESSING_STATUS_VALUES, validateMimeAndExtension()

### Community 39 - "Asset & Media Upload Subsystem"
Cohesion: 0.22
Nodes (7): AssetKind, validateSizeLimit(), AssetListQuery, CompleteUploadInput, createAssetService(), ReprocessAssetInput, RequestUploadUrlInput

### Community 40 - "Asset & Media Upload Subsystem"
Cohesion: 0.31
Nodes (10): validateDurationLimit(), createMediaWorkerService(), executeJobType(), processOnePendingJob(), processPendingJobs(), pullNextPendingJob(), refreshAssetStatus(), mapWorkerError() (+2 more)

### Community 41 - "Module: Footer"
Cohesion: 0.24
Nodes (5): Footer(), Header(), navLinks, SmoothScroll(), SmoothScrollProps

### Community 42 - "Card Editor & Draft Engine"
Cohesion: 0.33
Nodes (10): addTrack(), clampEditorTrackIndex(), createEmptyTrack(), moveTrack(), normalizeOptionalText(), normalizeText(), removeTrack(), syncLegacyMirror() (+2 more)

### Community 43 - "Card Editor & Draft Engine"
Cohesion: 0.31
Nodes (8): clampTrackIndex(), getAdjacentTrackIndex(), getShuffledTrackIndex(), PlaybackState, resolveNextTrackIndex(), resolveSelectedTrackIndex(), shouldAutoPlayOnTrackChange(), useMusicPlayback()

### Community 44 - "Card Editor & Draft Engine"
Cohesion: 0.27
Nodes (10): AudioContextCtor, createDefaultBars(), createFallbackBars(), getAudioContextCtor(), setupVisualizerGraph(), useMusicVisualizer(), UseMusicVisualizerParams, VisualizerGraphFallback (+2 more)

### Community 45 - "Page Contract & Domain Services"
Cohesion: 0.45
Nodes (10): asBlockType(), asGalleryItems(), asMusicTracks(), asOptionalText(), asRecord(), asText(), asTimestamp(), migrateBlock() (+2 more)

### Community 46 - "Module: vercel.json"
Cohesion: 0.18
Nodes (10): maxDuration, memory, buildCommand, functions, api/index.ts, installCommand, outputDirectory, rewrites (+2 more)

### Community 47 - "Dependency & Tooling Manifests"
Cohesion: 0.20
Nodes (9): name, overrides, ajv, minimatch, path-to-regexp, smol-toml, undici, private (+1 more)

### Community 48 - "Module: featureFlags"
Cohesion: 0.27
Nodes (6): EditorFlagDecision, featureFlags, hashToBucket(), resolveEditorAccessForUser(), resolveEditorMediaUploadAccessForUser(), loadFlagsModule()

### Community 50 - "Page Contract & Domain Services"
Cohesion: 0.25
Nodes (7): enqueueAssetMediaJobs(), getMediaJobTypesByKind(), MEDIA_JOB_TYPES, MEDIA_JOB_TYPES_BY_KIND, MediaJobType, AssetEventPayload, PageEventPayload

### Community 51 - "Card Editor & Draft Engine"
Cohesion: 0.22
Nodes (3): DESKTOP_WAVEFORM_BARS, MOBILE_WAVEFORM_BARS, WaveformBarModel

### Community 52 - "Module: BootLoadingGate"
Cohesion: 0.29
Nodes (3): BootLoadingGate(), faviconCleanup, HEARTBEAT_FRAMES

### Community 53 - "Card Editor & Draft Engine"
Cohesion: 0.32
Nodes (5): AssetSelectProps, formatTime(), isValidVideoUrl(), VideoBlock, VideoBlockComponent()

### Community 54 - "Card Editor & Draft Engine"
Cohesion: 0.32
Nodes (6): cloneBlockProps(), cloneTemplateBlocks(), generateBlockId(), Template, TemplateCategory, templates

### Community 55 - "Telemetry & Observability Infrastructure"
Cohesion: 0.29
Nodes (3): ErrorBoundary, Props, State

### Community 56 - "Card Editor & Draft Engine"
Cohesion: 0.38
Nodes (6): getMusicPlayerUIMode(), MUSIC_PLAYER_HAS_AUTOPLAY_TOGGLE, MUSIC_PLAYER_HAS_SHUFFLE_TOGGLE, MusicPlayerUIMode, shouldShowPlaylistControls(), shouldShowShuffleControl()

### Community 57 - "Card Editor & Draft Engine"
Cohesion: 0.38
Nodes (5): EMPTY_TRACKS, formatTime(), MusicBlock, MusicBlockComponent(), resolveWaveformHeights()

### Community 58 - "Card Editor & Draft Engine"
Cohesion: 0.33
Nodes (6): EDITOR_FIELD_BASE_CLASS, EDITOR_FIELD_LABEL_CLASS, EditorInputSection(), EditorInputSectionProps, resolveStateClasses(), SectionState

### Community 59 - "Card Editor & Draft Engine"
Cohesion: 0.60
Nodes (5): isPlayableHttpUrl(), normalizeMusicTracks(), normalizeTrack(), RuntimeMusicTrack, withLegacyMirrorFallback()

### Community 60 - "Card Editor & Draft Engine"
Cohesion: 0.33
Nodes (3): BlockControls, BlockControlsProps, blockTypeLabels

### Community 61 - "Card Editor & Draft Engine"
Cohesion: 0.33
Nodes (3): BlockWrapper, BlockWrapperProps, SortableHandleProps

### Community 66 - "Module: Container"
Cohesion: 0.40
Nodes (3): ContainerProps, ContainerSize, sizeClasses

### Community 68 - "Module: Button"
Cohesion: 0.40
Nodes (4): Button, ButtonProps, sizes, variants

### Community 71 - "Authentication & Identity Management"
Cohesion: 0.50
Nodes (4): AuthState, useAuthStore, User, withTimeout()

### Community 72 - "Visual Atmosphere & Hero Animations"
Cohesion: 0.67
Nodes (3): frameUrl(), HeroVideo(), HeroVideoProps

### Community 80 - "Card Editor & Draft Engine"
Cohesion: 0.83
Nodes (3): filterPreviewBlocks(), hasContent(), shouldRenderPreviewBlock()

## Knowledge Gaps
- **498 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+493 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppError` connect `Asset & Media Upload Subsystem` to `Page Contract & Domain Services`, `Page Contract & Domain Services`, `Asset & Media Upload Subsystem`, `Asset & Media Upload Subsystem`, `Asset & Media Upload Subsystem`, `Payment Gateway & Webhook Flow`, `Asset & Media Upload Subsystem`, `Authentication & Identity Management`, `Authentication & Identity Management`, `Page Contract & Domain Services`, `Payment Gateway & Webhook Flow`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Dependency & Tooling Manifests` to `Dependency & Tooling Manifests`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `prisma` connect `Page Contract & Domain Services` to `Page Contract & Domain Services`, `Asset & Media Upload Subsystem`, `Asset & Media Upload Subsystem`, `Payment Gateway & Webhook Flow`, `Page Contract & Domain Services`, `Payment Gateway & Webhook Flow`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _498 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Page Contract & Domain Services` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `Page Contract & Domain Services` be split into smaller, more focused modules?**
  _Cohesion score 0.0629800307219662 - nodes in this community are weakly interconnected._
- **Should `Page Contract & Domain Services` be split into smaller, more focused modules?**
  _Cohesion score 0.050241545893719805 - nodes in this community are weakly interconnected._