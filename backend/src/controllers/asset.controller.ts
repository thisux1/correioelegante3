import type { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../utils/AppError';
import { assetListQuerySchema } from '../utils/validation';
import { logAssetEvent } from '../utils/observability';
import { createAssetService } from '../services/asset.service';
import { CloudinaryMediaProvider } from '../services/cloudinaryMediaProvider';

const assetService = createAssetService(new CloudinaryMediaProvider());

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export async function requestAssetUploadUrl(req: AuthRequest, res: Response): Promise<void> {
  const startedAt = Date.now();
  try {
    const result = await assetService.requestUploadUrl({
      userId: req.userId!,
      kind: req.body.kind,
      fileName: req.body.fileName,
      mimeType: req.body.mimeType,
      sizeBytes: req.body.sizeBytes,
    });

    logAssetEvent({
      event: 'upload_url_requested',
      userId: req.userId!,
      assetId: result.asset.id,
      kind: result.asset.kind,
      durationMs: Date.now() - startedAt,
      result: 'success',
      statusCode: 201,
    });

    res.status(201).json(result);
  } catch (error) {
    const appError = error instanceof AppError ? error : undefined;
    logAssetEvent({
      event: 'upload_url_requested',
      userId: req.userId!,
      kind: req.body.kind,
      durationMs: Date.now() - startedAt,
      result: 'error',
      statusCode: appError?.statusCode,
      code: appError?.code,
    });
    throw error;
  }
}

export async function completeAssetUpload(req: AuthRequest, res: Response): Promise<void> {
  const startedAt = Date.now();
  try {
    const asset = await assetService.completeUpload({
      userId: req.userId!,
      assetId: req.body.assetId,
    });

    logAssetEvent({
      event: 'upload_completed',
      userId: req.userId!,
      assetId: asset.id,
      kind: asset.kind,
      durationMs: Date.now() - startedAt,
      result: 'success',
      statusCode: 200,
    });

    res.json({ asset });
  } catch (error) {
    const appError = error instanceof AppError ? error : undefined;
    logAssetEvent({
      event: 'upload_completed',
      userId: req.userId!,
      assetId: req.body.assetId,
      durationMs: Date.now() - startedAt,
      result: 'error',
      statusCode: appError?.statusCode,
      code: appError?.code,
    });
    throw error;
  }
}

export async function listAssets(req: AuthRequest, res: Response): Promise<void> {
  const startedAt = Date.now();
  const parsedQuery = assetListQuerySchema.parse(req.query);

  try {
    const assets = await assetService.listAssets(req.userId!, {
      kind: parsedQuery.kind,
    });

    logAssetEvent({
      event: 'asset_list',
      userId: req.userId!,
      kind: parsedQuery.kind,
      durationMs: Date.now() - startedAt,
      result: 'success',
      statusCode: 200,
    });

    res.json({ assets });
  } catch (error) {
    const appError = error instanceof AppError ? error : undefined;
    logAssetEvent({
      event: 'asset_list',
      userId: req.userId!,
      kind: parsedQuery.kind,
      durationMs: Date.now() - startedAt,
      result: 'error',
      statusCode: appError?.statusCode,
      code: appError?.code,
    });
    throw error;
  }
}

export async function getAsset(req: AuthRequest, res: Response): Promise<void> {
  const asset = await assetService.getAssetById(req.userId!, req.params.id as string);
  res.json({ asset });
}

export async function deleteAsset(req: AuthRequest, res: Response): Promise<void> {
  const startedAt = Date.now();

  try {
    const result = await assetService.deleteAsset(req.userId!, req.params.id as string);

    logAssetEvent({
      event: 'asset_delete',
      userId: req.userId!,
      assetId: result.id,
      durationMs: Date.now() - startedAt,
      result: 'success',
      statusCode: 200,
    });

    res.json({ message: 'Asset removido com sucesso.' });
  } catch (error) {
    const appError = error instanceof AppError ? error : undefined;
    logAssetEvent({
      event: 'asset_delete',
      userId: req.userId!,
      assetId: pickParam(req.params.id),
      durationMs: Date.now() - startedAt,
      result: 'error',
      statusCode: appError?.statusCode,
      code: appError?.code,
    });
    throw error;
  }
}
