import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { uploadMedia } from '../services/upload.service';
import { setMediaUrl } from '../services/message.service';
import { AppError } from '../utils/AppError';

export async function uploadMessageMedia(req: AuthRequest, res: Response): Promise<void> {
    if (!req.file) {
        throw new AppError('Nenhum arquivo enviado', 400);
    }

    const messageId = req.params.messageId as string;

    const mediaUrl = await uploadMedia(req.file.buffer, req.file.mimetype);
    const updated = await setMediaUrl(messageId, req.userId!, mediaUrl);

    res.json({ mediaUrl: updated.mediaUrl });
}
