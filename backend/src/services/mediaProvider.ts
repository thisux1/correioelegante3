export interface CreateUploadUrlInput {
  userId: string;
  kind: 'image' | 'audio' | 'video';
  mimeType: string;
  extension: string;
  sizeBytes: number;
}

export interface CreateUploadUrlResult {
  uploadUrl: string;
  publicUrl: string;
  storageKey: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  formFields?: Record<string, string>;
  expiresAt: string;
}

export interface CompleteUploadResult {
  publicUrl: string;
  width?: number;
  height?: number;
  durationMs?: number;
  bytes?: number;
}

export interface MediaProvider {
  createUploadUrl(input: CreateUploadUrlInput): Promise<CreateUploadUrlResult>;
  completeUpload(storageKey: string): Promise<CompleteUploadResult>;
  deleteAsset(storageKey: string): Promise<void>;
}
