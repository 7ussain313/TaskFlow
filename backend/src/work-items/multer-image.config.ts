import { randomUUID } from 'crypto';
import { join } from 'path';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = /^image\/(png|jpeg|webp)$/;

// Maps a validated mimetype to its stored extension. Deliberately not derived from
// file.originalname (fully attacker-controlled): a client could send Content-Type:
// image/png with filename="poc.html", and static-serving that with a .html extension
// would let a browser execute it as HTML instead of rendering it as an image.
const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

// Multer storage config for work item image attachments: saves to backend/uploads/
// under a random filename so originals never collide or leak the uploader's filesystem.
export const multerImageOptions: MulterOptions = {
  storage: diskStorage({
    destination: join(process.cwd(), 'uploads'),
    // Runs after fileFilter has already validated file.mimetype against
    // ALLOWED_IMAGE_MIME_TYPES, so the lookup below always hits.
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${EXTENSION_BY_MIME_TYPE[file.mimetype]}`);
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
