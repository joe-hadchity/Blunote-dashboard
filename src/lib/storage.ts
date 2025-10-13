import { supabase } from './supabase';

export type StorageBucket = 'meeting-videos' | 'meeting-audios' | 'meeting-transcripts';

/**
 * Upload a file to Supabase Storage
 * Files are organized by user ID: userId/filename
 */
export async function uploadFile(
  file: File,
  bucket: StorageBucket,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error: any) {
    console.error('Upload exception:', error);
    return { error: error.message || 'Unknown error occurred' };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  filePath: string,
  bucket: StorageBucket
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get file URL from storage
 */
export function getFileUrl(filePath: string, bucket: StorageBucket): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeMB: number = 500
): { valid: boolean; error?: string } {
  // Check file type
  const fileType = file.type;
  const isValidType = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return fileType.startsWith(type.replace('/*', ''));
    }
    return fileType === type;
  });

  if (!isValidType) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB (your file: ${fileSizeMB.toFixed(2)}MB)`,
    };
  }

  return { valid: true };
}

/**
 * Get signed URL for private files (if needed later)
 */
export async function getSignedUrl(
  filePath: string,
  bucket: StorageBucket,
  expiresIn: number = 3600
): Promise<{ url: string } | { error: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      return { error: error.message };
    }

    return { url: data.signedUrl };
  } catch (error: any) {
    return { error: error.message };
  }
}




