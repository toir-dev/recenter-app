import PostHog from 'posthog-react-native';

type PostHogClient = PostHog | null;

let client: PostHogClient = null;
let optedIn = false;

const getConfig = () => ({
  apiKey: process.env.EXPO_PUBLIC_POSTHOG_KEY,
  host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
});

export const ensurePostHog = () => {
  if (client) {
    return client;
  }

  const { apiKey, host } = getConfig();

  if (!apiKey) {
    return null;
  }

  client = new PostHog(apiKey, {
    host,
    captureAppLifecycleEvents: true,
    defaultOptIn: false,
  });

  if (optedIn) {
    client.optIn();
  }

  return client;
};

export const setAnalyticsOptIn = async (value: boolean) => {
  optedIn = value;
  const instance = ensurePostHog();
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
