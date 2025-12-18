import { createBrowserClient } from '@supabase/ssr';
import { supabaseUrl, supabaseKey, isSupabaseConfigured, isBrowser } from './supabase-config';

// Warn during build if env vars are missing
if (!isSupabaseConfigured && !isBrowser) {
  console.warn('Missing Supabase environment variables - using placeholder values for build');
}

// Create a proxy that throws helpful errors when not configured
const createSafeClient = () => {
  const client = createBrowserClient(supabaseUrl, supabaseKey);
  
  // If running in browser with placeholder values, wrap the client
  if (isBrowser && !isSupabaseConfigured) {
    return new Proxy(client, {
      get(target, prop) {
        // Allow certain properties to be accessed for compatibility
        if (prop === 'auth' || prop === 'from' || prop === 'storage') {
          const originalValue = target[prop as keyof typeof target];
          if (typeof originalValue === 'object' && originalValue !== null) {
            return new Proxy(originalValue, {
              get(authTarget, authProp) {
                // Throw error on actual API calls
                const value = authTarget[authProp as keyof typeof authTarget];
                if (typeof value === 'function') {
                  return function() {
                    throw new Error(
                      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
                    );
                  };
                }
                return value;
              }
            });
          }
          return originalValue;
        }
        return target[prop as keyof typeof target];
      }
    });
  }
  
  return client;
};

export const supabase = createSafeClient();
export { isSupabaseConfigured };
