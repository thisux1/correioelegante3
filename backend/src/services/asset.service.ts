import { AppError } from '../utils/AppError';
import { prisma } from '../utils/prisma';
import {
  type AssetKind,
  validateDurationLimit,
  validateMimeAndExtension,
  validateSizeLimit,
} from '../contracts/asset.contract';
import type { MediaProvider } from './mediaProvider';

interface RequestUploadUrlInput {
  userId: string;
  kind: AssetKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

interface CompleteUploadInput {
  userId: string;
  assetId: string;
}

interface AssetListQuery {
  kind?: AssetKind;
}

function mapMediaPolicyError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message === 'MEDIA_UNSUPPORTED_TYPE') {
      throw new AppError('Formato nao suportado. Envie um arquivo compativel.', 400, 'MEDIA_UNSUPPORTED_TYPE');
    }
    if (error.message === 'MEDIA_FILE_TOO_LARGE') {
      throw new AppError('Arquivo acima do limite do seu plano. Reduza o tamanho ou faca upgrade.', 400, 'MEDIA_FILE_TOO_LARGE');
    }
    if (error.message === 'MEDIA_DURATION_EXCEEDED') {
      throw new AppError('Duracao acima do permitido para seu plano.', 400, 'MEDIA_DURATION_EXCEEDED');
    }
  }

  throw error;
}

function toAssetResponse(asset: {
  id: string;
  userId: string;
  kind: string;
  source: string;
  storageKey: string;
  publicUrl: string | null;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  processingStatus: string;
  moderationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: asset.id,
    userId: asset.userId,
    kind: asset.kind,
    source: asset.source,
    storageKey: asset.storageKey,
    publicUrl: asset.publicUrl,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    width: asset.width,
    height: asset.height,
    durationMs: asset.durationMs,
    processingStatus: asset.processingStatus,
    moderationStatus: asset.moderationStatus,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
}

export function createAssetService(provider: MediaProvider) {
  return {
    async requestUploadUrl(input: RequestUploadUrlInput) {
      try {
        validateSizeLimit(input.kind, input.sizeBytes);
        const { extension } = validateMimeAndExtension({
          kind: input.kind,
          mimeType: input.mimeType,
          fileName: input.fileName,
        });

        const upload = await provider.createUploadUrl({
          userId: input.userId,
          kind: input.kind,
          mimeType: input.mimeType,
          extension,
          sizeBytes: input.sizeBytes,
        });

        const created = await prisma.asset.create({
          data: {
            userId: input.userId,
            kind: input.kind,
            source: 'upload',
            storageKey: upload.storageKey,
            publicUrl: upload.publicUrl,
            mimeType: input.mimeType,
            sizeBytes: input.sizeBytes,
            processingStatus: 'pending',
            moderationStatus: 'pending',
          },
        });

        return {
          asset: toAssetResponse(created),
          upload,
        };
      } catch (error) {
        mapMediaPolicyError(error);
      }
    },

    async completeUpload(input: CompleteUploadInput) {
      const asset = await prisma.asset.findUnique({ where: { id: input.assetId } });

      if (!asset || asset.userId !== input.userId) {
        throw new AppError('Voce nao tem permissao para usar esta midia.', 403, 'MEDIA_OWNER_MISMATCH');
      }

      const ownedAsset = asset;

      let result;
      try {
        result = await provider.completeUpload(ownedAsset.storageKey);
        validateDurationLimit(ownedAsset.kind as AssetKind, result.durationMs);
      } catch (error) {
        mapMediaPolicyError(error);
        await prisma.asset.update({
          where: { id: ownedAsset.id },
          data: { processingStatus: 'failed' },
        });
        throw error;
      }

      const updated = await prisma.asset.update({
        where: { id: ownedAsset.id },
        data: {
          publicUrl: result.publicUrl,
          width: result.width,
          height: result.height,
          durationMs: result.durationMs,
          sizeBytes: typeof result.bytes === 'number' ? result.bytes : ownedAsset.sizeBytes,
          processingStatus: 'ready',
        },
      });

      return toAssetResponse(updated);
    },

    async listAssets(userId: string, query: AssetListQuery) {
      const assets = await prisma.asset.findMany({
        where: {
          userId,
          ...(query.kind ? { kind: query.kind } : {}),
        },
        orderBy: { createdAt: 'desc' },
      });

      return assets.map(toAssetResponse);
    },

    async getAssetById(userId: string, assetId: string) {
      const asset = await prisma.asset.findUnique({ where: { id: assetId } });

      if (!asset || asset.userId !== userId) {
        throw new AppError('Voce nao tem permissao para usar esta midia.', 403, 'MEDIA_OWNER_MISMATCH');
      }

      return toAssetResponse(asset);
    },

    async deleteAsset(userId: string, assetId: string) {
      const asset = await prisma.asset.findUnique({ where: { id: assetId } });

      if (!asset || asset.userId !== userId) {
        throw new AppError('Voce nao tem permissao para usar esta midia.', 403, 'MEDIA_OWNER_MISMATCH');
      }

      await provider.deleteAsset(asset.storageKey);
      await prisma.asset.delete({ where: { id: asset.id } });

      return { id: asset.id };
    },
  };
}
