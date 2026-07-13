import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = /^image\/(png|jpeg|webp)$/;

// Multer storage config for work item image attachments: saves to backend/uploads/
// under a random filename so originals never collide or leak the uploader's filesystem.
export const multerImageOptions: MulterOptions = {
  storage: diskStorage({
    destination: join(process.cwd(), 'uploads'),
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  // Rejects a bad mime type before Multer ever writes bytes to disk, so an invalid
  // upload never leaves an orphaned file behind (ParseFilePipe's size check still
  // runs after this and applies to whatever did pass the type check).
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.test(file.mimetype)) {
      callback(
        new BadRequestException(
          `Unsupported image type "${file.mimetype}" — allowed types: PNG, JPEG, WEBP`,
        ),
        false,
      );
      return;
    }
    callback(null, true);
  },
};
