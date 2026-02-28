import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth';
import { validateObjectId } from '../middlewares/validate';
import { uploadMessageMedia } from '../controllers/upload.controller';

const router = Router();

// Armazena em memória para passar o Buffer ao Cloudinary
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não permitido'));
        }
    },
});

router.post('/:messageId', authenticate, validateObjectId('messageId'), upload.single('file'), uploadMessageMedia);

export { router as uploadRouter };
