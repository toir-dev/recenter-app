import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import type { Database } from '@/src/models/supabase';

import { env } from './env';
import { secureStore } from './secureStore';

const { supabaseUrl, supabaseAnonKey } = env;

let client: SupabaseClient<Database> | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] Missing URL or anon key; check your environment configuration.');
} else {
  client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key) => secureStore.getItem(key),
        setItem: (key, value) => secureStore.setItem(key, value),
        removeItem: (key) => secureStore.removeItem(key),
      },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = client;

export const getSupabaseClient = () => client;

export const hasSupabaseConfig = () => !!client;

export default client;
