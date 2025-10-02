import Constants from 'expo-constants';

type EnvShape = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiBaseUrl?: string;
};

const extractExtra = () => {
  const config = Constants?.expoConfig ?? Constants?.manifest;
  if (config && 'extra' in config && config.extra) {
    return config.extra as Record<string, unknown>;
  }

  return {} as Record<string, unknown>;
};

const extra = extractExtra();

const resolve = (keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
    if (key in extra) {
      const extraValue = extra[key];
      if (typeof extraValue === 'string' && extraValue.length > 0) {
        return extraValue;
      }
    }
  }

  return undefined;
};

const env: EnvShape = {
  supabaseUrl:
    resolve(['SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_URL', 'supabaseUrl']) ?? '',
  supabaseAnonKey:
    resolve(['SUPABASE_ANON_KEY', 'EXPO_PUBLIC_SUPABASE_ANON_KEY', 'supabaseAnonKey']) ?? '',
  apiBaseUrl: resolve(['API_BASE_URL', 'EXPO_PUBLIC_API_BASE_URL', 'apiBaseUrl']) ?? undefined,
};

export { env };
