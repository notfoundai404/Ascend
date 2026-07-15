import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 *
 * @param file       - The File/Blob to upload (from formData.get('image'))
 * @param bucket     - Storage bucket name (must exist in Supabase dashboard)
 * @param folder     - Sub-folder within the bucket (e.g. 'notices', 'events')
 * @returns          - Public URL of the uploaded file
 */
export async function uploadToStorage(
  file: File,
  bucket: string,
  folder: string
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}
