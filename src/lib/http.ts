import ky from 'ky';

import { env } from '@/src/lib/env';

const prefixUrl = env.apiBaseUrl && env.apiBaseUrl.length > 0 ? env.apiBaseUrl : undefined;

export const http = ky.create({
  prefixUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: {
    limit: 1,
  },
});

export default http;
