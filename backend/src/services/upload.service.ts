import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/AppError';

function configureCloudinary() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error('Credenciais do Cloudinary não configuradas');
    }
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });
}

// Configure once at module load — throws at startup if env vars are missing
configureCloudinary();

export async function uploadMedia(
    fileBuffer: Buffer,
    mimetype: string,
    folder = 'correio-elegante'
): Promise<string> {
    const resourceType = mimetype.startsWith('audio') ? 'video' : 'image';

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
                transformation: resourceType === 'image'
                    ? [{ quality: 'auto', fetch_format: 'auto' }]
                    : undefined,
            },
            (error, result) => {
                if (error || !result) {
                    reject(new AppError('Falha ao fazer upload da mídia', 500));
                    return;
                }
                resolve(result.secure_url);
            }
        );
        uploadStream.end(fileBuffer);
    });
}
