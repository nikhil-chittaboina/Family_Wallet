import { config } from '../config/env';

export function formatCurrency(value) {
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function userInitial(name = config.userName) {
  return name.trim().charAt(0).toUpperCase() || 'U';
}
