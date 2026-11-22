import crypto from 'crypto';

export const CLOUDINARY_CLOUD_NAME =
  (typeof process !== 'undefined' && process.env?.PUBLIC_CLOUDINARY_CLOUD_NAME) ||
  'dkrxyn8i5';

// Batas maksimal ukuran foto: 3 MB (3 * 1024 * 1024 bytes)
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
export const MAX_PHOTO_MB_LABEL = '3 MB';

/**
 * Mengoptimalkan URL gambar melalui Cloudinary CDN (f_auto,q_auto)
 * Mendukung URL Cloudinary penuh, Public ID (itpln-combat/news/...), maupun path lokal (/uploads/...).
 *
 * @param {string} src
 * @param {number} [width=1200]
 * @returns {string}
 */
export function resolveCloudinaryUrl(src, width = 1200) {
  if (!src) return '';
  const clean = String(src).trim();
  if (!clean) return '';

  // Jika sudah berupa URL Cloudinary, sisipkan f_auto,q_auto bila belum ada
  if (clean.includes('res.cloudinary.com')) {
    if (clean.includes('/upload/f_auto')) return clean;
    return clean.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`);
  }

  // Jika berupa path lokal (/uploads/..., /logo.webp) atau data URI atau URL eksternal lain
  if (clean.startsWith('/') || clean.startsWith('data:') || clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  // Jika berupa Cloudinary Public ID (contoh: itpln-combat/news/foto-1 atau itpln-combat/gallery/foto-2)
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}/${clean}`;
}

/**
 * Mengunggah gambar (base64 buffer) ke Cloudinary di folder `itpln-combat/news` atau `itpln-combat/gallery`
 * dengan validasi ukuran maksimal 3 MB.
 *
 * @param {Object} params
 * @param {string} params.base64Content - String base64 murni (tanpa prefix data:image/...)
 * @param {string} [params.mimeType='image/jpeg']
 * @param {'news' | 'gallery'} [params.subFolder='gallery']
 * @param {string} [params.publicId]
 */
export async function uploadToCloudinary({
  base64Content,
  mimeType = 'image/jpeg',
  subFolder = 'gallery',
  publicId,
}) {
  const buf = Buffer.from(base64Content, 'base64');
  if (buf.length > MAX_PHOTO_BYTES) {
    const sizeMb = (buf.length / (1024 * 1024)).toFixed(2);
    throw new Error(
      `Ukuran foto (${sizeMb} MB) melebihi batas maksimal ${MAX_PHOTO_MB_LABEL}! Silakan kompres foto terlebih dahulu.`
    );
  }

  const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dkrxyn8i5';
  let apiKey = process.env.PUBLIC_CLOUDINARY_API_KEY || '';
  let apiSecret = process.env.CLOUDINARY_API_SECRET || '';
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || '';

  // Parse dari CLOUDINARY_URL jika tersedia (cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
  if (process.env.CLOUDINARY_URL) {
    const m = process.env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (m) {
      apiKey = m[1];
      apiSecret = m[2];
    }
  }

  const targetFolder = `itpln-combat/${subFolder === 'news' ? 'news' : 'gallery'}`;
  const dataUri = `data:${mimeType};base64,${base64Content}`;
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  // 1. Jika API Key & API Secret tersedia -> Signed Upload ke folder itpln-combat/{news|gallery}
  if (apiKey && apiSecret) {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = {
      folder: targetFolder,
      ...(publicId ? { public_id: publicId } : {}),
      timestamp,
    };

    const signString =
      Object.keys(paramsToSign)
        .sort()
        .map((k) => `${k}=${paramsToSign[k]}`)
        .join('&') + apiSecret;

    const signature = crypto.createHash('sha1').update(signString).digest('hex');

    const form = new URLSearchParams();
    form.append('file', dataUri);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('folder', targetFolder);
    if (publicId) form.append('public_id', publicId);
    form.append('signature', signature);

    const res = await fetch(endpoint, { method: 'POST', body: form });
    const json = await res.json();
    if (res.ok && json.secure_url) {
      return {
        uploadedToCloudinary: true,
        url: json.secure_url,
        publicId: json.public_id,
        folder: targetFolder,
        bytes: json.bytes || buf.length,
      };
    }
  }

  // 2. Jika menggunakan Unsigned Upload Preset
  if (uploadPreset) {
    const form = new URLSearchParams();
    form.append('file', dataUri);
    form.append('upload_preset', uploadPreset);
    form.append('folder', targetFolder);
    if (publicId) form.append('public_id', publicId);

    const res = await fetch(endpoint, { method: 'POST', body: form });
    const json = await res.json();
    if (res.ok && json.secure_url) {
      return {
        uploadedToCloudinary: true,
        url: json.secure_url,
        publicId: json.public_id,
        folder: targetFolder,
        bytes: json.bytes || buf.length,
      };
    }
  }

  return {
    uploadedToCloudinary: false,
    folder: targetFolder,
    bytes: buf.length,
  };
}
