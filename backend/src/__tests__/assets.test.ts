import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../utils/prisma';
import { generateAccessToken } from '../utils/jwt';

vi.mock('../services/cloudinaryMediaProvider', () => {
  class MockCloudinaryMediaProvider {
    createUploadUrl = vi.fn().mockResolvedValue({
      uploadUrl: 'https://upload.example.com',
      publicUrl: 'https://cdn.example.com/asset.jpg',
      storageKey: 'image/user/asset-key',
      method: 'POST',
      headers: {},
      formFields: { signature: 'sig', api_key: 'key' },
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    completeUpload = vi.fn().mockResolvedValue({
      publicUrl: 'https://cdn.example.com/asset-ready.jpg',
      width: 1200,
      height: 800,
    });

    deleteAsset = vi.fn().mockResolvedValue(undefined);
  }

  return {
    CloudinaryMediaProvider: MockCloudinaryMediaProvider,
  };
});

const ownerUserId = '507f1f77bcf86cd799439000';
const otherUserId = '507f1f77bcf86cd799439999';
const assetId = '507f1f77bcf86cd799439123';

function makeToken(userId = ownerUserId) {
  return generateAccessToken(userId);
}

const baseAsset = {
  id: assetId,
  userId: ownerUserId,
  kind: 'image',
  source: 'upload',
  storageKey: 'image/user/asset-key',
  publicUrl: 'https://cdn.example.com/asset.jpg',
  posterUrl: null,
  waveform: null,
  mimeType: 'image/jpeg',
  sizeBytes: 1024,
  width: null,
  height: null,
  durationMs: null,
  processingStatus: 'pending',
  errorCode: null,
  errorMessage: null,
  moderationStatus: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  process.env.EDITOR_MEDIA_UPLOAD_ENABLED = 'true';
  process.env.EDITOR_MEDIA_UPLOAD_ROLLOUT_PERCENT = '100';
});

describe('POST /api/assets/upload-url', () => {
  it('201 - cria upload URL e registra asset', async () => {
    vi.mocked(prisma.asset.create).mockResolvedValue(baseAsset);

    const res = await request(app)
      .post('/api/assets/upload-url')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        kind: 'image',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
      });

    expect(res.status).toBe(201);
    expect(res.body.asset.id).toBe(assetId);
    expect(res.body.upload.uploadUrl).toContain('https://');
  });

  it('400 - rejeita tipo nao suportado', async () => {
    const res = await request(app)
      .post('/api/assets/upload-url')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        kind: 'image',
        fileName: 'photo.gif',
        mimeType: 'image/gif',
        sizeBytes: 1024,
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('MEDIA_UNSUPPORTED_TYPE');
  });
});

describe('POST /api/assets/complete', () => {
  it('200 - conclui upload do owner', async () => {
    vi.mocked(prisma.asset.findUnique).mockResolvedValue(baseAsset);
    vi.mocked(prisma.asset.update).mockResolvedValue({
      ...baseAsset,
      publicUrl: 'https://cdn.example.com/asset-ready.jpg',
      processingStatus: 'ready',
      width: 1200,
      height: 800,
    });

    const res = await request(app)
      .post('/api/assets/complete')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ assetId });

    expect(res.status).toBe(200);
    expect(res.body.asset.processingStatus).toBe('ready');
  });
});

describe('GET /api/assets and GET /api/assets/:id', () => {
  it('200 - lista assets do usuario autenticado', async () => {
    vi.mocked(prisma.asset.findMany).mockResolvedValue([baseAsset]);

    const res = await request(app)
      .get('/api/assets')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.assets).toHaveLength(1);
  });

  it('403 - bloqueia acesso a asset de outro usuario', async () => {
    vi.mocked(prisma.asset.findUnique).mockResolvedValue({
      ...baseAsset,
      userId: otherUserId,
    });

    const res = await request(app)
      .get(`/api/assets/${assetId}`)
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('MEDIA_OWNER_MISMATCH');
  });
});

describe('DELETE /api/assets/:id', () => {
  it('200 - remove asset do owner', async () => {
    vi.mocked(prisma.asset.findUnique).mockResolvedValue(baseAsset);
    vi.mocked(prisma.asset.delete).mockResolvedValue(baseAsset);

    const res = await request(app)
      .delete(`/api/assets/${assetId}`)
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
  });
});
