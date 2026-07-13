// Work item images are served at the API's origin under /uploads, not under the
// /api prefix used for JSON routes — this strips "/api" off NEXT_PUBLIC_API_URL.
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api').replace(
  /\/api\/?$/,
  '',
);

export function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  return `${API_ORIGIN}/uploads/${imagePath}`;
}
