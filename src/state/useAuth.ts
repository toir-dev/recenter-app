import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as Localization from 'expo-localization';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { secureStore } from '@/src/lib/secureStore';
import { getSupabaseClient, hasSupabaseConfig } from '@/src/lib/supabase';
import type { Database } from '@/src/models/supabase';

WebBrowser.maybeCompleteAuthSession();

type Profile = Database['public']['Tables']['profiles']['Row'];

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';
type PendingAction = 'email' | 'google' | 'password' | 'signup' | null;

export type ConsentPreferences = {
  termsAccepted: boolean;
  analytics: boolean;
};

type SignUpParams = {
  firstName: string;
  email: string;
  password: string;
  termsAccepted: boolean;
};

type AuthState = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  consents: ConsentPreferences;
  needsOnboarding: boolean;
  initialized: boolean;
  pending: PendingAction;
  error: string | null;
  profileError: string | null;
  setError: (message: string | null) => void;
  setConsents: (updates: Partial<ConsentPreferences>) => Promise<void>;
  initialize: () => Promise<void>;
  reloadProfile: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string; success?: boolean }>;
  signUpWithEmail: (params: SignUpParams) => Promise<{ error?: string; success?: boolean }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string; success?: boolean }>;
  signInWithGoogle: () => Promise<{ error?: string; success?: boolean }>;
  signOut: () => Promise<void>;
};

const OFFLINE_GRACE_MS = 1000 * 60 * 60 * 24;
const PROFILE_CACHE_KEY = 'auth.profile';
const SESSION_CACHE_KEY = 'auth.last_session';
const CONSENT_KEYS = {
  terms: 'consent.terms',
  privacy: 'consent.privacy',
  analytics: 'consent.analytics',
};
const ONBOARDING_COMPLETE_KEY = 'onboarding.completed';
const SUPABASE_MISSING_MESSAGE =
  'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY before running the app.';

type CachedSession = {
  user: User;
  lastSeenAt: number;
};

const parseBool = (value: string | null) => value === '1';
const serializeBool = (value: boolean) => (value ? '1' : '0');

const loadConsents = async (): Promise<ConsentPreferences> => {
  const [terms, privacyLegacy, analytics] = await Promise.all([
    secureStore.getItem(CONSENT_KEYS.terms),
    secureStore.getItem(CONSENT_KEYS.privacy),
    secureStore.getItem(CONSENT_KEYS.analytics),
  ]);

  return {
    termsAccepted: parseBool(terms) || parseBool(privacyLegacy),
    analytics: parseBool(analytics),
  };
};

const persistConsents = async (consents: ConsentPreferences) => {
  await Promise.all([
    secureStore.setItem(CONSENT_KEYS.terms, serializeBool(consents.termsAccepted)),
    secureStore.setItem(CONSENT_KEYS.privacy, serializeBool(consents.termsAccepted)),
    secureStore.setItem(CONSENT_KEYS.analytics, serializeBool(consents.analytics)),
  ]);
};

const loadOnboardingStatus = async (): Promise<boolean> => {
  const value = await secureStore.getItem(ONBOARDING_COMPLETE_KEY);
  return parseBool(value);
};

const persistOnboardingStatus = async (completed: boolean) => {
  if (completed) {
    await secureStore.setItem(ONBOARDING_COMPLETE_KEY, serializeBool(true));
    return;
  }
  await secureStore.removeItem(ONBOARDING_COMPLETE_KEY);
};

const loadProfileCache = async (): Promise<Profile | null> => {
  const raw = await secureStore.getItem(PROFILE_CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Profile;
  } catch (error) {
    console.warn('[auth] Failed to parse cached profile', error);
    await secureStore.removeItem(PROFILE_CACHE_KEY);
    return null;
  }
};

const persistProfileCache = async (profile: Profile | null) => {
  if (!profile) {
    await secureStore.removeItem(PROFILE_CACHE_KEY);
    return;
  }

  await secureStore.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
};

const loadSessionCache = async (): Promise<CachedSession | null> => {
  const raw = await secureStore.getItem(SESSION_CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as CachedSession;
    if (parsed?.user?.id) {
      return parsed;
    }
  } catch (error) {
    console.warn('[auth] Failed to parse cached session', error);
  }

  await secureStore.removeItem(SESSION_CACHE_KEY);
  return null;
};

const persistSessionCache = async (user: User | null) => {
  if (!user) {
    await secureStore.removeItem(SESSION_CACHE_KEY);
    return;
  }

  const payload: CachedSession = {
    user,
    lastSeenAt: Date.now(),
  };

  await secureStore.setItem(SESSION_CACHE_KEY, JSON.stringify(payload));
};

const computeNeedsOnboarding = (
  onboardingCompleted: boolean,
  consents: ConsentPreferences
) => (onboardingCompleted ? false : !consents.termsAccepted);

const redirectUri = AuthSession.makeRedirectUri({
  path: 'auth/callback',
  preferLocalhost: Platform.OS === 'web',
  // @ts-expect-error expo-auth-session supports this flag at runtime
  useProxy: true,
});

type AuthParams = Record<string, string>;

const toSearchParams = (url: string): AuthParams => {
  const normalized = url.includes('#') ? url.replace('#', '?') : url;
  const query = normalized.split('?')[1] ?? '';
  const params = new URLSearchParams(query);
  const result: AuthParams = {};
  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};

const isProfileNotFound = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: string }).code === 'PGRST116';

const getSupabaseErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined;
  }

  const code = (error as { code?: string }).code;
  return code ? String(code).toUpperCase() : undefined;
};

const isProfileAccessDenied = (error: unknown) => getSupabaseErrorCode(error) === '42501';

const logProfileWarning = (label: string, error: unknown) => {
  if (isProfileAccessDenied(error)) {
    return;
  }

  console.warn(label, error);
};

const requireSupabaseClient = (): SupabaseClient<Database> => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(SUPABASE_MISSING_MESSAGE);
  }

  return client;
};

const bootstrapProfile = async (
  client: SupabaseClient<Database>,
  userId: string
): Promise<Profile> => {
  const locales = Localization.getLocales();
  const calendars = Localization.getCalendars();
  const locale = locales?.[0]?.languageTag ?? 'en-US';
  const timezone = calendars?.[0]?.timeZone ?? 'UTC';

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error && !isProfileNotFound(error)) {
    throw error;
  }

  if (data) {
    return data;
  }

  const payload = {
    id: userId,
    display_name: null,
    locale,
    timezone,
  };

  const { data: inserted, error: insertError } = await client
    .from('profiles')
    .insert(payload)
    .select('*')
    .single();

  if (insertError) {
    throw insertError;
  }

  return inserted;
};

const applySessionParams = async (
  client: SupabaseClient<Database>,
  params: AuthParams
) => {
  if (params.error) {
    return { error: params.error_description ?? params.error };
  }

  if (params.access_token && params.refresh_token) {
    const { data, error } = await client.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.session?.user) {
      await persistSessionCache(data.session.user);
    }

    return { success: true };
  }

  if (params.code) {
    const { data, error } = await client.auth.exchangeCodeForSession(params.code);

    if (error) {
      return { error: error.message };
    }

    if (data.session?.user) {
      await persistSessionCache(data.session.user);
    }

    return { success: true };
  }

  return { error: 'No session information returned.' };
};

type AuthSubscription = { unsubscribe: () => void } | null;
let authSubscription: AuthSubscription = null;

export const useAuth = create<AuthState>()(
  immer((set, get) => ({
    status: 'loading',
    session: null,
    user: null,
    profile: null,
    consents: {
      termsAccepted: false,
      analytics: false,
    },
    needsOnboarding: true,
    initialized: false,
    pending: null,
    error: null,
    profileError: null,
    setError: (message) => {
      set((state) => {
        state.error = message;
      });
    },
    setConsents: async (updates) => {
      const current = get().consents;
      const next = { ...current, ...updates };
      await persistConsents(next);
      if (next.termsAccepted) {
        await persistOnboardingStatus(true);
      }
      set((state) => {
        state.consents = next;
        if (next.termsAccepted) {
          state.needsOnboarding = false;
        }
      });
    },
    initialize: async () => {
      if (get().initialized) {
        return;
      }

      set((state) => {
        state.status = 'loading';
        state.error = null;
      });

      const [consents, cachedProfile, cachedSession, onboardingCompleted] = await Promise.all([
        loadConsents(),
        loadProfileCache(),
        loadSessionCache(),
        loadOnboardingStatus(),
      ]);

      set((state) => {
        state.consents = consents;
        state.needsOnboarding = computeNeedsOnboarding(onboardingCompleted, consents);
        if (cachedProfile) {
          state.profile = cachedProfile;
        }
      });

      if (!hasSupabaseConfig()) {
        set((state) => {
          state.status = 'unauthenticated';
          state.error = SUPABASE_MISSING_MESSAGE;
          state.initialized = true;
        });
        return;
      }

      const client = requireSupabaseClient();

      const applySessionToState = (session: Session | null) => {
        set((state) => {
          state.session = session;
          state.user = session?.user ?? null;
          state.status = session?.user ? 'authenticated' : 'unauthenticated';
        });
      };

      try {
        const { data, error } = await client.auth.getSession();
        if (error) {
          throw error;
        }

        const session = data.session ?? null;
        applySessionToState(session);

        if (session?.user) {
          await persistSessionCache(session.user);
          try {
            const profile = await bootstrapProfile(client, session.user.id);
            await persistProfileCache(profile);
            set((state) => {
              state.profile = profile;
              state.profileError = null;
            });
          } catch (profileError) {
            logProfileWarning('[auth] Failed to load profile', profileError);
            const suppressed = isProfileAccessDenied(profileError);
            set((state) => {
              state.profileError = suppressed
                ? null
                : profileError instanceof Error
                ? profileError.message
                : 'Failed to load profile.';
            });
          }
        } else if (cachedSession && Date.now() - cachedSession.lastSeenAt < OFFLINE_GRACE_MS) {
          set((state) => {
            state.user = cachedSession.user;
            state.status = 'authenticated';
          });
        }
      } catch (error) {
        console.warn('[auth] initialize failed', error);
        if (cachedSession && Date.now() - cachedSession.lastSeenAt < OFFLINE_GRACE_MS) {
          set((state) => {
            state.user = cachedSession.user;
            state.status = 'authenticated';
            state.error = null;
          });
        } else {
          set((state) => {
            state.status = 'unauthenticated';
            state.error = error instanceof Error ? error.message : 'Failed to restore session.';
          });
        }
      } finally {
        set((state) => {
          state.initialized = true;
        });
      }

      if (!authSubscription) {
        const { data } = client.auth.onAuthStateChange(async (_event, session) => {
          await persistSessionCache(session?.user ?? null);
          applySessionToState(session);

          if (session?.user) {
            try {
              const profile = await bootstrapProfile(client, session.user.id);
              await persistProfileCache(profile);
              set((state) => {
                state.profile = profile;
                state.profileError = null;
              });
            } catch (profileError) {
              logProfileWarning('[auth] profile refresh failed', profileError);
              const suppressed = isProfileAccessDenied(profileError);
              set((state) => {
                state.profileError = suppressed
                  ? null
                  : profileError instanceof Error
                  ? profileError.message
                  : 'Failed to refresh profile.';
              });
            }
          } else {
            await persistProfileCache(null);
            set((state) => {
              state.profile = null;
            });
          }
        });

        authSubscription = data.subscription;
      }
    },
    reloadProfile: async () => {
      if (!hasSupabaseConfig()) {
        set((state) => {
          state.profileError = SUPABASE_MISSING_MESSAGE;
        });
        return;
      }

      const user = get().user;
      if (!user) {
        return;
      }

      set((state) => {
        state.profileError = null;
      });

      try {
        const client = requireSupabaseClient();
        const profile = await bootstrapProfile(client, user.id);
        await persistProfileCache(profile);
        set((state) => {
          state.profile = profile;
        });
      } catch (error) {
        console.warn('[auth] reload profile failed', error);
        set((state) => {
          state.profileError = error instanceof Error ? error.message : 'Failed to load profile.';
        });
      }
    },
    completeOnboarding: async () => {
      await persistOnboardingStatus(true);
      set((state) => {
        state.needsOnboarding = false;
      });
    },
    signInWithPassword: async (email, password) => {
      if (!hasSupabaseConfig()) {
        set((state) => {
          state.error = SUPABASE_MISSING_MESSAGE;
        });
        return { error: SUPABASE_MISSING_MESSAGE };
      }

      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !password) {
        const message = 'Email and password are required.';
        set((state) => {
          state.error = message;
        });
        return { error: message };
      }

      const client = requireSupabaseClient();

      set((state) => {
        state.pending = 'password';
        state.error = null;
      });

      const { data, error } = await client.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      set((state) => {
        state.pending = null;
      });

      if (error) {
        const message = error.message ?? 'Sign-in failed.';
        set((state) => {
          state.error = message;
        });
        return { error: message };
      }

      const session = data?.session ?? null;

      if (session?.user) {
        await persistSessionCache(session.user);
        set((state) => {
          state.session = session;
          state.user = session.user;
          state.status = 'authenticated';
          state.error = null;
        });
        await get().reloadProfile();
      }

      return { success: true };
    },
    signUpWithEmail: async ({ firstName, email, password, termsAccepted }) => {
      if (!hasSupabaseConfig()) {
        set((state) => {
          state.error = SUPABASE_MISSING_MESSAGE;
        });
        return { error: SUPABASE_MISSING_MESSAGE };
      }

      const trimmedName = firstName.trim();
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedName) {
        const message = 'First name is required.';
        set((state) => {
          state.error = message;
        });
        return { error: message };
      }

      if (!trimmedEmail) {
        const message = 'Email is required.';
        set((state) => {
          state.error = message;
        });
        return { error: message };
      }

      if (!password) {
        const message = 'Password is required.';
        set((state) => {
          state.error = message;
        });
        return { error: message };
      }

      if (!termsAccepted) {
        const message = 'Please accept the terms before continuing.';
        set((state) => {
          state.error = message;
        });
        return { error: message };
      }

      const client = requireSupabaseClient();

      set((state) => {
        state.pending = 'signup';
        state.error = null;
      });

      const { data, error } = await client.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            first_name: trimmedName,
          },
        },
      });

      set((state) => {
        state.pending = null;
      });

      if (error) {
        const message = error.message ?? 'Sign-up failed.';
        set((state) => {
          state.error = message;
        });
        return { error: message };
      }

      const user = data?.user ?? null;
      const session = data?.session ?? null;

      if (user?.id) {
        await get().setConsents({ termsAccepted: true });
        try {
          await bootstrapProfile(client, user.id);
          await client
            .from('profiles')
            .update({ display_name: trimmedName })
            .eq('id', user.id);
        } catch (profileError) {
          logProfileWarning('[auth] sign-up profile bootstrap failed', profileError);
        }
      }

      if (session?.user) {
        await persistSessionCache(session.user);
        set((state) => {
          state.session = session;
          state.user = session.user;
          state.status = 'authenticated';
          state.error = null;
        });
        await get().reloadProfile();
      }

      return { success: true };
    },
    signInWithMagicLink: async (email) => {
      if (!hasSupabaseConfig()) {
        set((state) => {
          state.error = SUPABASE_MISSING_MESSAGE;
        });
        return { error: SUPABASE_MISSING_MESSAGE };
      }

      if (!email) {
        const message = 'Email is required.';
        set((state) => {
          state.error = message;
        });
        return { error: message };
      }

      const client = requireSupabaseClient();

      set((state) => {
        state.pending = 'email';
        state.error = null;
      });

      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUri,
        },
      });

      set((state) => {
        state.pending = null;
      });

      if (error) {
        const message = error.message ?? 'Failed to send magic link.';
        set((state) => {
          state.error = message;
        });
        return { error: message };
      }

      return { success: true };
    },
    signInWithGoogle: async () => {
      if (!hasSupabaseConfig()) {
        set((state) => {
          state.error = SUPABASE_MISSING_MESSAGE;
        });
        return { error: SUPABASE_MISSING_MESSAGE };
      }

      const client = requireSupabaseClient();

      set((state) => {
        state.pending = 'google';
        state.error = null;
      });

      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'consent select_account',
            access_type: 'offline',
            include_granted_scopes: 'true',
          },
        },
      });

      if (error) {
        const message = error.message ?? 'Google sign-in failed.';
        set((state) => {
          state.pending = null;
          state.error = message;
        });
        return { error: message };
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

        if (result.type === 'success' && result.url) {
          const params = toSearchParams(result.url);
          const outcome = await applySessionParams(client, params);
          if (outcome.error) {
            set((state) => {
              state.pending = null;
              state.error = outcome.error ?? 'Authentication failed.';
            });
            return { error: outcome.error };
          }
          await get().setConsents({ termsAccepted: true });
          await get().reloadProfile();
          set((state) => {
            state.pending = null;
          });
          return { success: true };
        }

        if (result.type === 'cancel' || result.type === 'dismiss') {
          const message = 'Sign-in was cancelled.';
          set((state) => {
            state.pending = null;
            state.error = message;
          });
          return { error: message };
        }

        set((state) => {
          state.pending = null;
          state.error = 'Authentication did not complete.';
        });
        return { error: 'Authentication did not complete.' };
      }

      set((state) => {
        state.pending = null;
        state.error = 'Missing authorization URL.';
      });
      return { error: 'Missing authorization URL.' };
    },
    signOut: async () => {
      if (hasSupabaseConfig()) {
        const client = requireSupabaseClient();
        await client.auth.signOut();
      }

      await persistSessionCache(null);
      await persistProfileCache(null);

      set((state) => {
        state.session = null;
        state.user = null;
        state.profile = null;
        state.status = 'unauthenticated';
        state.error = null;
      });
    },
  }))
);

export const applySessionFromUrl = async (url: string) => {
  if (!hasSupabaseConfig()) {
    return { error: SUPABASE_MISSING_MESSAGE };
  }

  const client = requireSupabaseClient();
  const params = toSearchParams(url);
  const outcome = await applySessionParams(client, params);

  if (!outcome.error) {
    const { user } = useAuth.getState();

    if (!user && (params.access_token || params.code)) {
      const { data } = await client.auth.getSession();
      if (data.session?.user) {
        await persistSessionCache(data.session.user);
        await useAuth.getState().reloadProfile();
      }
    } else if (user) {
      await useAuth.getState().reloadProfile();
    }
  }

  return outcome;
};

















