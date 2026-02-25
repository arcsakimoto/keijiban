import heic2any from "heic2any";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.85;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];

/** ファイルのバリデーション */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `ファイルサイズが大きすぎます（上限10MB）: ${file.name}` };
  }
  const type = file.type.toLowerCase();
  const ext = file.name.toLowerCase().split(".").pop();
  if (!ACCEPTED_TYPES.includes(type) && ext !== "heic" && ext !== "heif") {
    return { valid: false, error: `対応していない形式です（JPEG/PNG/HEIC）: ${file.name}` };
  }
  return { valid: true };
}

/** HEIC→JPEG変換＋長辺1200px以下にリサイズしてBlobを返す */
export async function processImage(file: File): Promise<Blob> {
  let blob: Blob = file;

  // HEIC/HEIF の場合は JPEG に変換
  const type = file.type.toLowerCase();
  const ext = file.name.toLowerCase().split(".").pop();
  if (type === "image/heic" || type === "image/heif" || ext === "heic" || ext === "heif") {
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: JPEG_QUALITY });
    blob = Array.isArray(converted) ? converted[0] : converted;
  }

  // Canvas でリサイズ
  const bitmap = await createImageBitmap(blob);
  const { width, height } = bitmap;

  // 長辺が MAX_DIMENSION 以下ならリサイズ不要（ただしJPEG再圧縮はする）
  let targetW = width;
  let targetH = height;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width >= height) {
      targetW = MAX_DIMENSION;
      targetH = Math.round(height * (MAX_DIMENSION / width));
    } else {
      targetH = MAX_DIMENSION;
      targetW = Math.round(width * (MAX_DIMENSION / height));
    }
  }

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  return canvas.convertToBlob({ type: "image/jpeg", quality: JPEG_QUALITY });
}

/** Storage 用のファイルパスを生成 */
export function generateImagePath(userId: string): string {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  return `${userId}/${timestamp}-${uuid}.jpg`;
}
