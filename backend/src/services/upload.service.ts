import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/AppError';

let cloudinaryConfigured = false;

function ensureCloudinaryConfigured() {
    if (cloudinaryConfigured) {
        return;
    }

    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, NODE_ENV } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        if (NODE_ENV === 'test') {
            cloudinary.config({
                cloud_name: 'test_cloud',
                api_key: 'test_key',
                api_secret: 'test_secret',
            });
            cloudinaryConfigured = true;
            return;
        }

        throw new AppError('Servico de upload indisponivel: credenciais do Cloudinary nao configuradas', 503);
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });
    cloudinaryConfigured = true;
}

export async function uploadMedia(
    fileBuffer: Buffer,
    mimetype: string,
    folder = 'correio-elegante'
): Promise<string> {
    ensureCloudinaryConfigured();

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
