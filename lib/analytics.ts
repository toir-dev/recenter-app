import type PostHog from "posthog-react-native";

type PostHogInstance = PostHog | null;

let client: PostHogInstance = null;
let loadTask: Promise<PostHogInstance> | null = null;
let optedIn = false;
let warned = false;

const getConfig = () => ({
  apiKey: process.env.EXPO_PUBLIC_POSTHOG_KEY,
  host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
});

const createClient = async (): Promise<PostHogInstance> => {
  const { apiKey, host } = getConfig();

  if (!apiKey) {
    return null;
  }

  try {
    const module = await import("posthog-react-native");
    const PostHogCtor = module.default as typeof PostHog;

    client = new PostHogCtor(apiKey, {
      host,
      captureAppLifecycleEvents: true,
      defaultOptIn: false,
    });

    if (optedIn) {
      client.optIn();
    }

    return client;
  } catch (error) {
    if (!warned) {
      console.warn("[analytics] PostHog native module unavailable, analytics disabled.", error);
      warned = true;
    }
    client = null;
    return null;
  }
};

export const ensurePostHog = async (): Promise<PostHogInstance> => {
  if (client) {
    return client;
  }

  if (!loadTask) {
    loadTask = createClient().finally(() => {
      loadTask = null;
    });
  }

  const instance = await loadTask;
  if (!instance) {
    client = null;
  }

  return client;
};

export const setAnalyticsOptIn = async (value: boolean) => {
  optedIn = value;
  const instance = await ensurePostHog();
  if (!instance) {
    return null;
  }

  if (value) {
    await instance.optIn();
    return instance;
  }

  await instance.optOut();
  await instance.flush();
  return instance;
};

export const isAnalyticsEnabled = () => optedIn && !!client;

export default ensurePostHog;
