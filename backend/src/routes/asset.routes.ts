import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { requireEditorMediaUploadFeature } from '../middlewares/editorMediaFeatureFlag';
import { validate, validateObjectId } from '../middlewares/validate';
import {
  completeAssetUpload,
  deleteAsset,
  getAsset,
  listAssets,
  reprocessAsset,
  requestAssetUploadUrl,
} from '../controllers/asset.controller';
import {
  assetCompleteSchema,
  assetReprocessSchema,
  assetUploadUrlSchema,
} from '../utils/validation';

const router = Router();

router.post('/upload-url', authenticate, requireEditorMediaUploadFeature, validate(assetUploadUrlSchema), requestAssetUploadUrl);
router.post('/complete', authenticate, requireEditorMediaUploadFeature, validate(assetCompleteSchema), completeAssetUpload);
router.post('/reprocess', authenticate, requireEditorMediaUploadFeature, validate(assetReprocessSchema), reprocessAsset);
router.get('/', authenticate, requireEditorMediaUploadFeature, listAssets);
router.get('/:id', authenticate, requireEditorMediaUploadFeature, validateObjectId('id'), getAsset);
router.delete('/:id', authenticate, requireEditorMediaUploadFeature, validateObjectId('id'), deleteAsset);

export { router as assetRouter };
