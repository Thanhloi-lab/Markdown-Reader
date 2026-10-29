import { Locale, TranslationSchema } from './types';
import { vi } from './locales/vi';
import { en } from './locales/en';

export * from './types';
export { vi, en };

export const translations: Record<Locale, TranslationSchema> = {
  vi,
  en
};

/**
 * Trả về từ điển dịch tương ứng với locale
 */
export function getTranslations(locale: Locale = 'vi'): TranslationSchema {
  return translations[locale] || translations.vi;
}

/**
 * Tự động phát hiện locale từ trình duyệt
 */
export function detectBrowserLocale(): Locale {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    const lang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    if (lang.startsWith('vi')) {
      return 'vi';
    }
  }
  return 'en';
}
