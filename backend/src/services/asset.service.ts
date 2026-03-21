import { AppError } from '../utils/AppError';
import { prisma } from '../utils/prisma';
import {
  type AssetKind,
  validateDurationLimit,
  validateMimeAndExtension,
  validateSizeLimit,
} from '../contracts/asset.contract';
import type { MediaProvider } from './mediaProvider';
import { createMediaWorkerService } from './mediaWorker.service';
import { enqueueAssetMediaJobs, getMediaJobTypesByKind } from './mediaJob.service';

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

interface ReprocessAssetInput {
  userId: string;
  assetId: string;
}

function mapMediaPolicyError(error: unknown): AppError | null {
  if (error instanceof Error) {
    if (error.message === 'MEDIA_UNSUPPORTED_TYPE') {
      return new AppError('Formato nao suportado. Envie um arquivo compativel.', 400, 'MEDIA_UNSUPPORTED_TYPE');
    }
    if (error.message === 'MEDIA_FILE_TOO_LARGE') {
      return new AppError('Arquivo acima do limite do seu plano. Reduza o tamanho ou faca upgrade.', 400, 'MEDIA_FILE_TOO_LARGE');
    }
    if (error.message === 'MEDIA_DURATION_EXCEEDED') {
      return new AppError('Duracao acima do permitido para seu plano.', 400, 'MEDIA_DURATION_EXCEEDED');
    }
  }

  return null;
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
  posterUrl?: string | null;
  waveform?: unknown | null;
  errorCode?: string | null;
  errorMessage?: string | null;
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
    posterUrl: asset.posterUrl ?? null,
    waveform: asset.waveform ?? null,
    processingStatus: asset.processingStatus,
    errorCode: asset.errorCode ?? null,
    errorMessage: asset.errorMessage ?? null,
    moderationStatus: asset.moderationStatus,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
}

export function createAssetService(provider: MediaProvider) {
  const prismaDb = prisma as unknown as any;
  const mediaWorkerService = createMediaWorkerService(provider);

  function triggerBackgroundProcessing(): void {
    void mediaWorkerService.processPendingJobs(10).catch(() => undefined);
  }

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

        const created = await prismaDb.asset.create({
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
        const mappedError = mapMediaPolicyError(error);
        if (mappedError) {
          throw mappedError;
        }

        throw error;
      }
    },

    async completeUpload(input: CompleteUploadInput) {
      const asset = await prismaDb.asset.findUnique({ where: { id: input.assetId } });

      if (!asset || asset.userId !== input.userId) {
        throw new AppError('Voce nao tem permissao para usar esta midia.', 403, 'MEDIA_OWNER_MISMATCH');
      }

      const ownedAsset = asset;

      let result;
      try {
        result = await provider.completeUpload(ownedAsset.storageKey);
        validateDurationLimit(ownedAsset.kind as AssetKind, result.durationMs);
      } catch (error) {
        const mappedError = mapMediaPolicyError(error);
        const failure = mappedError ?? (error instanceof AppError
          ? error
          : new AppError('Nao foi possivel processar esta midia. Tente outro arquivo.', 422, 'MEDIA_PROCESSING_FAILED'));

        await prismaDb.asset.update({
          where: { id: ownedAsset.id },
          data: {
            processingStatus: 'failed',
            errorCode: failure.code,
            errorMessage: failure.message,
          },
        });
        throw failure;
      }

      const kind = ownedAsset.kind as AssetKind;
      const shouldQueueMediaJobs = getMediaJobTypesByKind(kind).length > 0;

      const updated = await prismaDb.asset.update({
        where: { id: ownedAsset.id },
        data: {
          publicUrl: result.publicUrl,
          width: result.width,
          height: result.height,
          durationMs: result.durationMs,
          sizeBytes: typeof result.bytes === 'number' ? result.bytes : ownedAsset.sizeBytes,
          processingStatus: shouldQueueMediaJobs ? 'processing' : 'ready',
          errorCode: null,
          errorMessage: null,
        },
      });

      if (shouldQueueMediaJobs) {
        await enqueueAssetMediaJobs({
          userId: input.userId,
          assetId: ownedAsset.id,
          kind,
        });
        triggerBackgroundProcessing();
      }

      return toAssetResponse(updated);
    },

    async reprocessAsset(input: ReprocessAssetInput) {
      const asset = await prismaDb.asset.findUnique({ where: { id: input.assetId } });

      if (!asset || asset.userId !== input.userId) {
        throw new AppError('Voce nao tem permissao para usar esta midia.', 403, 'MEDIA_OWNER_MISMATCH');
      }

      const kind = asset.kind as AssetKind;
      const jobTypes = getMediaJobTypesByKind(kind);
      if (jobTypes.length === 0) {
        return toAssetResponse(asset);
      }

      await prismaDb.asset.update({
        where: { id: asset.id },
        data: {
          processingStatus: 'pending',
          errorCode: null,
          errorMessage: null,
        },
      });

      await enqueueAssetMediaJobs({
        userId: input.userId,
        assetId: asset.id,
        kind,
      });

      triggerBackgroundProcessing();

      const updated = await prismaDb.asset.findUnique({ where: { id: asset.id } });
      if (!updated) {
        throw new AppError('Asset nao encontrado apos reprocessamento.', 404, 'MEDIA_NOT_FOUND');
      }

      return toAssetResponse(updated);
    },

    async listAssets(userId: string, query: AssetListQuery) {
      const assets = await prismaDb.asset.findMany({
        where: {
          userId,
          ...(query.kind ? { kind: query.kind } : {}),
        },
        orderBy: { createdAt: 'desc' },
      });

      return assets.map(toAssetResponse);
    },

    async getAssetById(userId: string, assetId: string) {
      const asset = await prismaDb.asset.findUnique({ where: { id: assetId } });

      if (!asset || asset.userId !== userId) {
        throw new AppError('Voce nao tem permissao para usar esta midia.', 403, 'MEDIA_OWNER_MISMATCH');
      }

      return toAssetResponse(asset);
    },

    async deleteAsset(userId: string, assetId: string) {
      const asset = await prismaDb.asset.findUnique({ where: { id: assetId } });

      if (!asset || asset.userId !== userId) {
        throw new AppError('Voce nao tem permissao para usar esta midia.', 403, 'MEDIA_OWNER_MISMATCH');
      }

      await provider.deleteAsset(asset.storageKey);
      await prismaDb.asset.delete({ where: { id: asset.id } });

      return { id: asset.id };
    },
  };
}
