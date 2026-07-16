import { supabase } from "@/lib/supabaseClient";

export const IMAGES_BUCKET = "images";

export async function uploadPlaceImages(files) {
  const urls = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `public/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(IMAGES_BUCKET).upload(path, file);
    if (error) throw new Error(`فشل رفع الصورة "${file.name}": ${error.message}`);

    const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export function encodeImageUrls(urls) {
  return urls.length > 0 ? JSON.stringify(urls) : null;
}

export function decodeImageUrls(imageUrl) {
  if (!imageUrl) return [];
  try {
    const parsed = JSON.parse(imageUrl);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return [imageUrl];
  }
}
