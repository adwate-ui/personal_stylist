/**
 * Shared Supabase configuration utilities
 */

// Fallback values for build time when environment variables are not available
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Check if configuration is valid
export const isSupabaseConfigured = 
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && 
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  !supabaseUrl.includes('placeholder');

// Check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';
