import multer from 'multer';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/AppError';

export const UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (_req, file, cb) {
    const extension = ALLOWED.get(file.mimetype) ?? '.bin';
    cb(null, `${file.fieldname}-${randomUUID()}${extension}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!ALLOWED.has(file.mimetype)) {
    return cb(new AppError(400, 'Only JPEG, PNG, WebP or GIF images are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

export const uploads = {
  single: (fieldName: string) => upload.single(fieldName),
  array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
  fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray),
};

const MAGIC_BYTES: { ext: string; test: (buf: Buffer) => boolean }[] = [
  { ext: '.jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: '.png',
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    ext: '.webp',
    test: (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  { ext: '.gif', test: (b) => b.subarray(0, 6).toString('ascii').startsWith('GIF8') },
];

function sniff(filePath: string): string | null {
  const handle = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(12);
    fs.readSync(handle, buffer, 0, 12, 0);
    return MAGIC_BYTES.find((entry) => entry.test(buffer))?.ext ?? null;
  } finally {
    fs.closeSync(handle);
  }
}

function collect(req: Express.Request): Express.Multer.File[] {
  if (Array.isArray(req.files)) return req.files;
  if (req.files) return Object.values(req.files).flat();
  return req.file ? [req.file] : [];
}

export const validateUploadedImages: import('express').RequestHandler = (req, _res, next) => {
  const files = collect(req);
  if (files.length === 0) return next();

  for (const file of files) {
    let actual: string | null = null;
    try {
      actual = sniff(file.path);
    } catch {
      actual = null;
    }

    if (!actual || actual !== path.extname(file.path).toLowerCase()) {
      for (const f of files) {
        fs.promises.unlink(f.path).catch(() => undefined);
      }
      return next(new AppError(400, 'Uploaded file is not a valid image'));
    }
  }

  next();
};
