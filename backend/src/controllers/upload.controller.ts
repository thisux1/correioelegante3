import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { uploadMedia } from '../services/upload.service';
import { setMediaUrl } from '../services/message.service';
import { AppError } from '../utils/AppError';

// Assinaturas de magic bytes aceitas — o Content-Type enviado pelo cliente é
// controlável, portanto o tipo real do arquivo deve ser validado pelo conteúdo.
const ascii = (u: Uint8Array) => Buffer.from(u).toString('ascii');

const FILE_SIGNATURES: Array<{ mime: string; test: (buf: Buffer) => boolean }> = [
  { mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: 'image/png',
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a,
  },
  { mime: 'image/gif', test: (b) => ascii(b.subarray(0, 3)) === 'GIF' },
  {
    mime: 'image/webp',
    test: (b) => ascii(b.subarray(0, 4)) === 'RIFF' && ascii(b.subarray(8, 12)) === 'WEBP',
  },
  { mime: 'audio/mpeg', test: (b) => ascii(b.subarray(0, 3)) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) },
  { mime: 'audio/wav', test: (b) => ascii(b.subarray(0, 4)) === 'RIFF' && ascii(b.subarray(8, 12)) === 'WAVE' },
  { mime: 'audio/ogg', test: (b) => ascii(b.subarray(0, 4)) === 'OggS' },
];

function validateFileSignature(buffer: Buffer, claimedMime: string): void {
  const signature = FILE_SIGNATURES.find((s) => s.mime === claimedMime);
  if (!signature || !signature.test(buffer)) {
    throw new AppError(
      'O conteúdo do arquivo não corresponde ao tipo declarado.',
      400,
      'FILE_SIGNATURE_MISMATCH',
    );
  }
}

export async function uploadMessageMedia(req: AuthRequest, res: Response): Promise<void> {
    if (!req.file) {
        throw new AppError('Nenhum arquivo enviado', 400);
    }

    validateFileSignature(req.file.buffer, req.file.mimetype);

    const messageId = req.params.messageId as string;

    const mediaUrl = await uploadMedia(req.file.buffer, req.file.mimetype);
    const updated = await setMediaUrl(messageId, req.userId!, mediaUrl);

    res.json({ mediaUrl: updated.mediaUrl });
}
