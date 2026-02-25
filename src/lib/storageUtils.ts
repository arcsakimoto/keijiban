import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "post-images";

/** 画像を Supabase Storage にアップロードし、公開 URL を返す */
export async function uploadImage(
  supabase: SupabaseClient,
  blob: Blob,
  path: string
): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });

  if (error) throw new Error(`画像のアップロードに失敗しました: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** 公開 URL から Storage パスを抽出 */
function extractPath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

/** 1枚の画像を Storage から削除 */
export async function deleteImage(
  supabase: SupabaseClient,
  publicUrl: string
): Promise<void> {
  const path = extractPath(publicUrl);
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

/** 複数画像を一括削除 */
export async function deleteImages(
  supabase: SupabaseClient,
  publicUrls: string[]
): Promise<void> {
  const paths = publicUrls
    .map(extractPath)
    .filter((p): p is string => p !== null);
  if (paths.length === 0) return;
  await supabase.storage.from(BUCKET).remove(paths);
}
