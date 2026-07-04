const trimTrailingSlash = (value) => (value ? value.replace(/\/$/, '') : '');

export const config = {
  /** Backend base URL. Empty string uses same-origin + Vite dev proxy. */
  apiUrl: trimTrailingSlash(import.meta.env.VITE_API_URL ?? ''),
  userName: import.meta.env.VITE_USER_NAME || 'User',
  currency: import.meta.env.VITE_CURRENCY || 'INR',
  locale: import.meta.env.VITE_LOCALE || 'en-IN',
};

export const apiBasePath = config.apiUrl ? `${config.apiUrl}/api` : '/api';
