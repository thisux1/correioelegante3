# Correio Elegante — Technical Specification (SPEC.md)

Version: `1.0.0`  
Last Updated: `2026-08-18`  
Status: `Active / Authoritative`

---

## 1. Product Overview & Vision

**Correio Elegante** is a modern, high-touch digital experience platform enabling users to create, personalize, and share rich interactive love letters, commemorative messages, multimedia tributes, and custom web pages.

### Core Value Propositions
- **Interactive Block-Based Editor**: Drag-and-drop letter creation with real-time preview, rich typography, background atmospheres, audio/music playback, galleries, and countdown timers.
- **Hybrid Monetization**: Pay-per-message / pay-per-page model supporting Stripe (Credit Card, Boleto, Apple/Google Pay) and Mercado Pago (Pix QR Code).
- **Public & Private Shareability**: Public links, unlisted links, and owner-managed private links with instant QR code generation.
- **Automated Video Export**: Automated Remotion-powered video generation rendering letters as motion videos for social sharing (Instagram Stories, TikTok).

---

## 2. Monorepo Structure & Module Boundaries

The workspace is organized as an unhoisted monorepo with distinct responsibility boundaries:

```
correioelegante3/
├── frontend/          # React 19 + Vite + Tailwind v4 + Zustand + Framer Motion (SPA)
├── backend/           # Express 5 + TypeScript + Prisma (MongoDB) + Vitest API
├── my-video/          # Remotion 4 + React 19 + Tailwind v4 Motion Video Engine
├── api/               # Vercel Serverless Function entrypoints
├── graphify-out/      # Codebase knowledge graph, interactive HTML & audit report
├── docs/              # Visual assets, architecture diagrams, performance audits
└── package.json       # Root orchestration (dev, test, lint, typecheck, build, graphify)
```

---

## 3. Data Models & Entity Schemas (Prisma / MongoDB)

All identifiers are MongoDB ObjectIDs (`@id @default(auto()) @map("_id") @db.ObjectId`).

### 3.1 `User`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `String (ObjectId)` | Primary key |
| `email` | `String` (Unique) | User email (normalized lowercase) |
| `password` | `String` | Bcrypt hash (min 10 salt rounds) |
| `messages` | `Message[]` | 1:N relationship |
| `pages` | `Page[]` | 1:N relationship |
| `assets` | `Asset[]` | 1:N relationship |
| `consents` | `UserConsent[]` | LGPD / Terms acceptance records |
| `refundRequests` | `RefundRequest[]`| Customer refund tickets |
| `createdAt` / `updatedAt` | `DateTime` | Timestamps |

### 3.2 `Message` (Classic Letter)
| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String (ObjectId)` | - | Unique message ID |
| `userId` | `String (ObjectId)` | - | Foreign key to `User` |
| `recipient` | `String` | - | Recipient name / moniker |
| `message` | `String` | - | Text content of the letter |
| `mediaUrl` | `String?` | `null` | Optional hero image / video URL |
| `theme` | `String` | `"classic"` | Theme identifier (`classic`, `romantic`, `cyberpunk`, etc.) |
| `status` | `String` | `"draft"` | `"draft"` \| `"published"` \| `"archived"` |
| `visibility` | `String` | `"public"` | `"public"` \| `"unlisted"` \| `"private"` |
| `publishedAt` | `DateTime?` | `null` | Instant when letter became active |
| `paymentStatus` | `String` | `"pending"` | `"pending"` \| `"paid"` \| `"refunded"` |
| `paymentId` | `String?` | `null` | Provider transaction identifier |
| `paymentProvider` | `String?` | `null` | `"stripe"` \| `"mercadopago"` |
| `paymentMethod` | `String?` | `null` | `"credit_card"` \| `"pix"` \| `"boleto"` |

### 3.3 `Page` (Interactive Multimedia Page)
| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String (ObjectId)` | - | Unique page ID |
| `userId` | `String (ObjectId)` | - | Foreign key to `User` |
| `content` | `Json` | - | Serialized `PageContent` block array & theme metadata |
| `version` | `Int` | `1` | Optimistic locking counter |
| `status` | `String` | `"draft"` | `"draft"` \| `"published"` \| `"archived"` |
| `visibility` | `String` | `"public"` | `"public"` \| `"unlisted"` \| `"private"` |
| `publishedAt` | `DateTime?` | `null` | Publication timestamp |
| `paymentStatus` | `String` | `"pending"` | `"pending"` \| `"paid"` |
| `paymentId` | `String?` | `null` | Provider charge ID |
| `paymentProvider` | `String?` | `null` | Provider name |
| `paymentMethod` | `String?` | `null` | Payment method |

### 3.4 `Asset` (Media Assets)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `String (ObjectId)` | Unique asset ID |
| `userId` | `String (ObjectId)` | Uploader ID |
| `kind` | `String` | `"image"` \| `"video"` \| `"audio"` |
| `source` | `String` | `"direct_upload"` \| `"editor"` |
| `storageKey` | `String` | Cloudinary public ID / S3 key |
| `publicUrl` | `String?` | Public CDN URL |
| `posterUrl` | `String?` | Video thumbnail or audio poster image |
| `waveform` | `Json?` | Normalized audio peak amplitudes for visualizer |
| `mimeType` | `String` | `image/jpeg`, `image/png`, `video/mp4`, `audio/mpeg`, etc. |
| `sizeBytes` | `Int` | File size in bytes |
| `width` / `height` | `Int?` | Dimensions (for video/image) |
| `durationMs` | `Int?` | Duration (for video/audio) |
| `processingStatus` | `String` | `"pending"` \| `"processing"` \| `"completed"` \| `"failed"` |
| `moderationStatus` | `String` | `"pending"` \| `"approved"` \| `"rejected"` |

---

## 4. API Endpoints & Contracts

Base URL in development: `http://localhost:3000/api` (proxied by Vite to `/api`).

### 4.1 Authentication (`/api/auth`)
- `POST /register`: Creates account. Body: `{ email, password }`. Returns `{ user, accessToken }`, sets `refreshToken` httpOnly cookie.
- `POST /login`: Authenticates user. Body: `{ email, password }`. Returns `{ user, accessToken }`, sets `refreshToken` cookie.
- `POST /refresh`: Uses httpOnly `refreshToken` cookie to issue new `{ accessToken }`.
- `POST /logout`: Clears `refreshToken` cookie.
- `GET /me`: Returns `{ user }` for authenticated requester.
- `POST /change-password`: Changes password with current password verification.
- `POST /export`: Returns GDPR/LGPD archive of user messages, pages, and assets.
- `DELETE /account`: Purges user account and cascading entities.

### 4.2 Messages (`/api/messages`)
- `GET /`: Lists all messages owned by authenticated user.
- `POST /`: Creates draft message. Body: `{ recipient, message, mediaUrl?, theme?, visibility? }`.
- `GET /:id`: Retrieves message by ID (Owner only if unpublished/private).
- `GET /card/:id`: Public access endpoint. Accessible without auth **only if** `paymentStatus === 'paid'` and `visibility !== 'private'`.
- `DELETE /:id`: Deletes message (Owner only).

### 4.3 Pages (`/api/pages`)
- `GET /`: Lists all pages created by authenticated user.
- `POST /`: Creates page. Body: `{ content, status?, visibility?, publishedAt? }`.
- `GET /:id`: Retrieves page. Handles ownership bypass, unlisted access, and public lifecycle gating.
- `PUT /:id`: Updates page with optimistic concurrency check (`expectedVersion`).
- `DELETE /:id`: Deletes page (Owner only).

### 4.4 Payments (`/api/payments`)
- `POST /create`: Creates a Stripe card payment or a Mercado Pago Pix payment.
  - Body: `{ paymentMethod: "pix" | "credit_card", resourceType: "message" | "page", resourceId: string, messageId?: string }`
  - Pix response (canonical Mercado Pago QR Code):
    ```
    { paymentId, status: "pending", pixQrCode: string, pixQrCodeBase64: string, pixExpiresAt: ISO8601, preferenceId: null, checkoutUrl: null }
    ```
    `pixQrCode` is the "copia e cola" EMV payload; `pixQrCodeBase64` is the canonical QR image rendered by Mercado Pago; `pixExpiresAt` is the QR expiration time (default 30 min).
  - Card response: `{ sessionId, checkoutUrl }`.
  - Errors: `400` invalid payload/already paid, `403` ownership, `502 PIX_PAYMENT_CREATION_FAILED` when Mercado Pago API fails, `502 PIX_QR_CODE_UNAVAILABLE` when no QR is returned.
- `GET /status/:messageId`: Returns `{ paymentStatus, paymentProvider, paymentMethod }`.
- `GET /status/:resourceType/:resourceId`: Resource-agnostic status query.
- `POST /webhook/stripe`: Stripe webhook handler verifying `stripe-signature`. On `checkout.session.completed`, marks resource `paymentStatus = "paid"`.
- `POST /webhook/mercadopago`: Mercado Pago IPN webhook handler verifying `x-signature`/`x-request-id`. On `payment` with `status = "approved"`, marks the resource identified by `metadata` (or `external_reference`) as `paymentStatus = "paid"`.

### 4.5 Assets (`/api/assets`)
- `POST /upload-url`: Requests signed upload URL and creates pending `Asset`.
  - Body: `{ filename, mimeType, sizeBytes, kind: "image" | "video" | "audio" }`.
  - Validates mime against allowed types and file size limits (Images ≤ 10MB, Audio ≤ 25MB, Video ≤ 50MB).
- `POST /complete`: Confirms upload completion, triggering asynchronous `MediaJob` processing.
- `GET /`: Lists user assets with filter by `kind` and pagination.
- `GET /:id`: Returns detailed asset status and processed URLs.
- `POST /reprocess`: Re-queues processing jobs for failed or updated assets.
- `DELETE /:id`: Deletes asset from CDN storage and database.

---

## 5. Editor Block Schema & Versioning

The editor represents interactive pages as an ordered collection of serialized blocks:

```typescript
type BlockType = 'text' | 'media' | 'music' | 'gallery' | 'timer' | 'canvas';

interface BaseBlock {
  id: string;
  type: BlockType;
  version: number;
}

interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  align?: 'left' | 'center' | 'right';
  fontFamily?: string;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
}

interface MediaBlock extends BaseBlock {
  type: 'media';
  url: string;
  kind: 'image' | 'video';
  caption?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
}

interface MusicBlock extends BaseBlock {
  type: 'music';
  tracks: Array<{
    id: string;
    title: string;
    artist?: string;
    audioUrl: string;
    coverUrl?: string;
  }>;
  autoPlay?: boolean;
  loop?: boolean;
}

interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  items: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
  columns?: 2 | 3 | 4;
}

interface TimerBlock extends BaseBlock {
  type: 'timer';
  targetDate: string; // ISO 8601
  title?: string;
  style?: 'compact' | 'cards' | 'minimal';
}
```

### Autosave & Concurrency Strategy
- **Local Persistence**: Drafts are continuously synced to `localStorage` with a 300ms debounce.
- **Server Sync**: Changes saved via `PUT /api/pages/:id` sending `expectedVersion`. If server version is greater, client receives `409 PAGE_VERSION_CONFLICT` and prompts conflict resolution modal.

---

## 6. Security, Authentication & Rate Limiting

1. **Access Tokens**: JWT signed with `JWT_SECRET`, expiring in 15 minutes. Sent via `Authorization: Bearer <token>`.
2. **Refresh Tokens**: JWT signed with `JWT_REFRESH_SECRET`, expiring in 7 days. Stored in an `httpOnly`, `Secure`, `SameSite=Lax` cookie (`/api/auth/refresh`).
3. **CORS & Helmet**: Backend sets explicit allowed origin (`FRONTEND_URL`), enables strict Content Security Policy headers, and protects against clickjacking and MIME-sniffing.
4. **Rate Limiting**:
   - Authentication endpoints: 10 requests per minute per IP.
   - Asset upload requests: 20 requests per minute per user.
   - Page write mutations: 60 requests per minute per user.
5. **Input Validation**: All request bodies validated with `Zod` schemas via the `validate` middleware before reaching controllers.
