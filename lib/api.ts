import ky from 'ky';

export const apiClient = ky.create({
  prefixUrl: 'https://example.com/api',
  retry: 0,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
