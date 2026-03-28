import { AppError } from '../utils/AppError';
import { prisma } from '../utils/prisma';
import type { MediaProvider, ProcessAssetResult } from './mediaProvider';
import type { MediaJobType } from './mediaJob.service';
import { validateDurationLimit, type AssetKind } from '../contracts/asset.contract';
import { logAssetEvent } from '../utils/observability';

const prismaDb = prisma;

type PersistedMediaJob = {
  id: string;
  assetId: string;
  userId: string;
  type: string;
  status: string;
  attempts: number;
  maxAttempts: number;
};

function mapWorkerError(error: unknown): { code: string; message: string } {
  if (error instanceof AppError) {
    return {
      code: error.code ?? 'MEDIA_PROCESSING_FAILED',
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'MEDIA_PROCESSING_FAILED',
      message: error.message,
    };
  }

  return {
    code: 'MEDIA_PROCESSING_FAILED',
    message: 'Nao foi possivel processar esta midia. Tente outro arquivo.',
  };
}

function toJobType(type: string): MediaJobType {
  if (type === 'poster' || type === 'waveform') {
    return type;
  }

  return 'transcode';
}

export function createMediaWorkerService(provider: MediaProvider) {
  async function executeJobType(storageKey: string, type: MediaJobType): Promise<ProcessAssetResult> {
    if (type === 'poster') {
      return provider.generatePoster(storageKey);
    }

    if (type === 'waveform') {
      return provider.generateWaveform(storageKey);
    }

    return provider.transcodeAsset(storageKey);
  }

  async function pullNextPendingJob(): Promise<PersistedMediaJob | null> {
    const pending = await prismaDb.mediaJob.findFirst({
      where: {
        status: 'pending',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!pending) {
      return null;
    }

    const claimed = await prismaDb.mediaJob.updateMany({
      where: {
        id: pending.id,
        status: 'pending',
      },
      data: {
        status: 'processing',
        startedAt: new Date(),
        attempts: {
          increment: 1,
        },
      },
    });

    if (claimed.count === 0) {
      return null;
    }

    const current = await prismaDb.mediaJob.findUnique({ where: { id: pending.id } });
    if (!current) {
      return null;
    }

    return {
      id: current.id,
      assetId: current.assetId,
      userId: current.userId,
      type: current.type,
      status: current.status,
      attempts: current.attempts,
      maxAttempts: current.maxAttempts,
    };
  }

  async function refreshAssetStatus(assetId: string): Promise<void> {
    const jobs = await prismaDb.mediaJob.findMany({
      where: { assetId },
      select: { status: true, errorCode: true, errorMessage: true },
    }) as Array<{ status: string; errorCode: string | null; errorMessage: string | null }>;

    if (jobs.length === 0) {
      await prismaDb.asset.update({
        where: { id: assetId },
        data: {
          processingStatus: 'ready',
          errorCode: null,
          errorMessage: null,
        },
      });
      return;
    }

    const failed = jobs.find((job: { status: string }) => job.status === 'failed');
    if (failed) {
      await prismaDb.asset.update({
        where: { id: assetId },
        data: {
          processingStatus: 'failed',
          errorCode: failed.errorCode ?? 'MEDIA_PROCESSING_FAILED',
          errorMessage: failed.errorMessage ?? 'Nao foi possivel processar esta midia. Tente outro arquivo.',
        },
      });
      return;
    }

    const hasPendingOrRunning = jobs.some((job: { status: string }) => job.status === 'pending' || job.status === 'processing');
    if (hasPendingOrRunning) {
      await prismaDb.asset.update({
        where: { id: assetId },
        data: {
          processingStatus: 'processing',
          errorCode: null,
          errorMessage: null,
        },
      });
      return;
    }

    await prismaDb.asset.update({
      where: { id: assetId },
      data: {
        processingStatus: 'ready',
        errorCode: null,
        errorMessage: null,
      },
    });
  }

  async function processOnePendingJob(): Promise<boolean> {
    const claimedJob = await pullNextPendingJob();
    if (!claimedJob) {
      return false;
    }

    const startedAt = Date.now();

    const asset = await prismaDb.asset.findUnique({ where: { id: claimedJob.assetId } });
    if (!asset) {
      await prismaDb.mediaJob.update({
        where: { id: claimedJob.id },
        data: {
          status: 'failed',
          errorCode: 'MEDIA_ASSET_NOT_FOUND',
          errorMessage: 'Asset nao encontrado para processamento.',
          finishedAt: new Date(),
        },
      });
      return true;
    }

    logAssetEvent({
      event: 'media_job_started',
      userId: claimedJob.userId,
      assetId: claimedJob.assetId,
      kind: asset.kind,
      durationMs: 0,
      result: 'success',
      code: claimedJob.type,
    });

    try {
      const result = await executeJobType(asset.storageKey, toJobType(claimedJob.type));

      validateDurationLimit(asset.kind as AssetKind, result.durationMs ?? asset.durationMs);

      await prismaDb.$transaction(async (tx) => {
        await tx.mediaJob.update({
          where: { id: claimedJob.id },
          data: {
            status: 'completed',
            errorCode: null,
            errorMessage: null,
            finishedAt: new Date(),
          },
        });

        await tx.asset.update({
          where: { id: claimedJob.assetId },
          data: {
            processingStatus: 'processing',
            errorCode: null,
            errorMessage: null,
            publicUrl: result.publicUrl ?? undefined,
            posterUrl: result.posterUrl ?? undefined,
            waveform: result.waveform ?? undefined,
            durationMs: typeof result.durationMs === 'number' ? result.durationMs : undefined,
            width: typeof result.width === 'number' ? result.width : undefined,
            height: typeof result.height === 'number' ? result.height : undefined,
            sizeBytes: typeof result.bytes === 'number' ? result.bytes : undefined,
          },
        });
      });

      await refreshAssetStatus(claimedJob.assetId);

      logAssetEvent({
        event: 'media_job_success',
        userId: claimedJob.userId,
        assetId: claimedJob.assetId,
        kind: asset.kind,
        durationMs: Date.now() - startedAt,
        result: 'success',
        code: claimedJob.type,
      });

      return true;
    } catch (error) {
      const mapped = mapWorkerError(error);
      const shouldRetry = claimedJob.attempts < claimedJob.maxAttempts;

      await prismaDb.mediaJob.update({
        where: { id: claimedJob.id },
        data: {
          status: shouldRetry ? 'pending' : 'failed',
          errorCode: mapped.code,
          errorMessage: mapped.message,
          finishedAt: shouldRetry ? null : new Date(),
        },
      });

      await refreshAssetStatus(claimedJob.assetId);

      logAssetEvent({
        event: 'media_job_failure',
        userId: claimedJob.userId,
        assetId: claimedJob.assetId,
        kind: asset.kind,
        durationMs: Date.now() - startedAt,
        result: 'error',
        code: mapped.code,
      });

      return true;
    }
  }

  async function processPendingJobs(limit = 10): Promise<number> {
    let processed = 0;
    while (processed < limit) {
      const didProcess = await processOnePendingJob();
      if (!didProcess) {
        break;
      }

      processed += 1;
    }

    return processed;
  }

  return {
    processPendingJobs,
    processOnePendingJob,
  };
}
