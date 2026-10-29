import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Locale,
  TranslationSchema,
  getTranslations,
  detectBrowserLocale
} from '@markdown-reader/core';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: TranslationSchema;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'markdown_reader_locale';

// Safe chrome API reference for cross-platform support (Web & Extension)
const getChromeStorage = () => {
  if (typeof globalThis !== 'undefined' && (globalThis as any).chrome?.storage?.local) {
    return (globalThis as any).chrome.storage.local;
  }
  return null;
};

export const I18nProvider: React.FC<{
  initialLocale?: Locale;
  children: React.ReactNode;
}> = ({ initialLocale, children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale) return initialLocale;

    // 1. Kiểm tra localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as Locale;
        if (saved === 'vi' || saved === 'en') {
          return saved;
        }
      } catch (e) {
        console.warn('Cannot load locale from localStorage:', e);
      }
    }

    // 2. Tự động nhận diện từ trình duyệt
    return detectBrowserLocale();
  });

  // Đồng bộ từ chrome.storage.local nếu trong Chrome Extension
  useEffect(() => {
    const storage = getChromeStorage();
    if (storage) {
      storage.get([STORAGE_KEY], (result: Record<string, any>) => {
        const saved = result?.[STORAGE_KEY] as Locale;
        if (saved === 'vi' || saved === 'en') {
          setLocaleState(saved);
        }
      });
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);

    // Lưu vào localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newLocale);
      } catch (e) {
        console.warn('Cannot save locale to localStorage:', e);
      }
    }

    // Lưu vào chrome.storage.local nếu có
    const storage = getChromeStorage();
    if (storage) {
      storage.set({ [STORAGE_KEY]: newLocale });
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'vi' ? 'en' : 'vi');
  }, [locale, setLocale]);

  const t = useMemo(() => getTranslations(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t
    }),
    [locale, setLocale, toggleLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback an toàn nếu component render ngoài provider
    return {
      locale: 'vi',
      setLocale: () => {},
      toggleLocale: () => {},
      t: getTranslations('vi')
    };
  }
  return context;
};

export const useI18n = useTranslation;
