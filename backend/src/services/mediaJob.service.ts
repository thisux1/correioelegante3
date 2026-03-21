import { prisma } from '../utils/prisma';
import { logAssetEvent } from '../utils/observability';

const prismaDb = prisma as unknown as any;

export const MEDIA_JOB_TYPES = ['transcode', 'poster', 'waveform'] as const;
export type MediaJobType = (typeof MEDIA_JOB_TYPES)[number];

const MEDIA_JOB_TYPES_BY_KIND: Record<'image' | 'audio' | 'video', MediaJobType[]> = {
  image: [],
  audio: ['transcode', 'waveform'],
  video: ['transcode', 'poster'],
};

export function getMediaJobTypesByKind(kind: 'image' | 'audio' | 'video'): MediaJobType[] {
  return MEDIA_JOB_TYPES_BY_KIND[kind];
}

export async function enqueueAssetMediaJobs(params: {
  userId: string;
  assetId: string;
  kind: 'image' | 'audio' | 'video';
}): Promise<void> {
  const jobTypes = getMediaJobTypesByKind(params.kind);

  for (const type of jobTypes) {
    const existing = await prismaDb.mediaJob.findUnique({
      where: {
        assetId_type: {
          assetId: params.assetId,
          type,
        },
      },
    });

    if (!existing) {
      await prismaDb.mediaJob.create({
        data: {
          assetId: params.assetId,
          userId: params.userId,
          type,
          status: 'pending',
          attempts: 0,
          maxAttempts: 3,
          errorCode: null,
          errorMessage: null,
          startedAt: null,
          finishedAt: null,
        },
      });
    } else if (existing.status === 'failed' || existing.status === 'completed') {
      await prismaDb.mediaJob.update({
        where: { id: existing.id },
        data: {
          status: 'pending',
          attempts: 0,
          errorCode: null,
          errorMessage: null,
          startedAt: null,
          finishedAt: null,
        },
      });
    }

    logAssetEvent({
      event: 'media_job_enqueued',
      userId: params.userId,
      assetId: params.assetId,
      kind: params.kind,
      result: 'success',
      durationMs: 0,
      code: type,
    });
  }
}
