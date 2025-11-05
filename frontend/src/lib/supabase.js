import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIG_ERROR = 'Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';

let supabaseClient = null;
let supabaseInitError = null;

if (!supabaseUrl || !supabaseAnonKey) {
  supabaseInitError = SUPABASE_CONFIG_ERROR;
} else {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: window.localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'supabase.auth.token',
        debug: false
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to initialise Supabase client.';
    supabaseInitError = message;
  }
}

export const supabase = supabaseClient;
export const isSupabaseConfigured = Boolean(supabaseClient);
export const supabaseConfigurationError = supabaseInitError;

export const assertSupabaseConfigured = () => {
  if (!supabaseClient) {
    throw new Error(supabaseInitError || SUPABASE_CONFIG_ERROR);
  }
  return supabaseClient;
};

// Storage configuration
const storageUrl = import.meta.env.VITE_SUPABASE_STORAGE_URL;
const bucketName = import.meta.env.VITE_SUPABASE_BUCKET_NAME || 'restaurant-images';

export const STORAGE_CONFIG = {
  bucketName,
  storageUrl,
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '', 10) || 5 * 1024 * 1024, // 5MB
  allowedTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp').split(',')
};

// Storage helper functions
export const uploadFile = async (file, path) => {
  const client = assertSupabaseConfigured();
  const { data, error } = await client.storage
    .from(STORAGE_CONFIG.bucketName)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = client.storage
    .from(STORAGE_CONFIG.bucketName)
    .getPublicUrl(data.path);

  return publicUrl;
};

export const deleteFile = async (path) => {
  const client = assertSupabaseConfigured();
  const { error } = await client.storage
    .from(STORAGE_CONFIG.bucketName)
    .remove([path]);

  if (error) {
    throw new Error(`File deletion failed: ${error.message}`);
  }
};
