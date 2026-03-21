import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { AppError } from '../utils/AppError';
import type {
  CompleteUploadResult,
  CreateUploadUrlInput,
  CreateUploadUrlResult,
  MediaProvider,
} from './mediaProvider';

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new AppError(
      `Configuracao de midia ausente: defina ${name} para habilitar upload.`,
      503,
      'MEDIA_PROVIDER_MISCONFIGURED',
    );
  }

  return value;
}

function getCloudinaryCredentialsFromUrl() {
  const rawUrl = process.env.CLOUDINARY_URL?.trim();
  if (!rawUrl) {
    return null;
  }

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'cloudinary:') {
      throw new Error('invalid-protocol');
    }

    const apiKey = decodeURIComponent(parsed.username);
    const apiSecret = decodeURIComponent(parsed.password);
    const cloudName = parsed.hostname;

    if (!apiKey || !apiSecret || !cloudName) {
      throw new Error('missing-fields');
    }

    return {
      cloudName,
      apiKey,
      apiSecret,
    };
  } catch {
    throw new AppError(
      'CLOUDINARY_URL invalida. Use o formato cloudinary://<api_key>:<api_secret>@<cloud_name>.',
      503,
      'MEDIA_PROVIDER_MISCONFIGURED',
    );
  }
}

function resolveCloudinaryResourceType(kind: 'image' | 'audio' | 'video'): 'image' | 'video' {
  return kind === 'image' ? 'image' : 'video';
}

export class CloudinaryMediaProvider implements MediaProvider {
  private cloudName?: string;
  private apiKey?: string;
  private apiSecret?: string;
  private configured = false;

  constructor() {
    const urlCredentials = getCloudinaryCredentialsFromUrl();
    if (urlCredentials) {
      this.cloudName = urlCredentials.cloudName;
      this.apiKey = urlCredentials.apiKey;
      this.apiSecret = urlCredentials.apiSecret;
      return;
    }

    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    this.apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    this.apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  }

  private ensureConfigured(): void {
    if (this.configured) {
      return;
    }

    this.cloudName = this.cloudName || getRequiredEnv('CLOUDINARY_CLOUD_NAME');
    this.apiKey = this.apiKey || getRequiredEnv('CLOUDINARY_API_KEY');
    this.apiSecret = this.apiSecret || getRequiredEnv('CLOUDINARY_API_SECRET');

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    });

    this.configured = true;
  }

  async createUploadUrl(input: CreateUploadUrlInput): Promise<CreateUploadUrlResult> {
    this.ensureConfigured();
    const cloudName = this.cloudName as string;
    const apiKey = this.apiKey as string;
    const apiSecret = this.apiSecret as string;

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `correio-elegante-v2/${input.userId}/${input.kind}`;
    const basePublicId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const publicId = basePublicId;
    const fullPublicId = `${folder}/${publicId}`;
    const resourceType = resolveCloudinaryResourceType(input.kind);

    const signature = cloudinary.utils.api_sign_request(
      {
        folder,
        public_id: publicId,
        timestamp,
      },
      apiSecret,
    );

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      publicUrl: `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${fullPublicId}`,
      storageKey: `${resourceType}/${fullPublicId}`,
      method: 'POST',
      headers: {},
      formFields: {
        api_key: apiKey,
        timestamp: String(timestamp),
        folder,
        public_id: publicId,
        signature,
      },
      expiresAt: new Date((timestamp + 60 * 10) * 1000).toISOString(),
    };
  }

  async completeUpload(storageKey: string): Promise<CompleteUploadResult> {
    this.ensureConfigured();

    const [resourceTypeRaw, ...publicIdParts] = storageKey.split('/');
    const publicId = publicIdParts.join('/');
    const resourceType = resourceTypeRaw === 'image' ? 'image' : 'video';

    if (!publicId) {
      throw new AppError('Storage key invalida para completar upload.', 400, 'MEDIA_STORAGE_KEY_INVALID');
    }

    try {
      const resource = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
        type: 'upload',
      });

      const upload = resource as UploadApiResponse & { duration?: number; bytes?: number };
      return {
        publicUrl: upload.secure_url,
        width: upload.width,
        height: upload.height,
        durationMs: typeof upload.duration === 'number' ? Math.floor(upload.duration * 1000) : undefined,
        bytes: upload.bytes,
      };
    } catch {
      throw new AppError('Nao foi possivel concluir o upload da midia.', 422, 'MEDIA_PROCESSING_FAILED');
    }
  }

  async deleteAsset(storageKey: string): Promise<void> {
    this.ensureConfigured();

    const [resourceTypeRaw, ...publicIdParts] = storageKey.split('/');
    const publicId = publicIdParts.join('/');
    const resourceType = resourceTypeRaw === 'image' ? 'image' : 'video';

    if (!publicId) {
      throw new AppError('Storage key invalida para remocao de asset.', 400, 'MEDIA_STORAGE_KEY_INVALID');
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: 'upload',
      invalidate: true,
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new AppError('Falha ao remover midia no provider.', 502, 'MEDIA_PROVIDER_DELETE_FAILED');
    }
  }
}
