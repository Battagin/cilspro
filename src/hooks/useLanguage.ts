import { useState, useEffect } from 'react';
import { Language, defaultLanguage, getTranslation, type Translations } from '@/lib/i18n';

export type { Language };

const LANGUAGE_STORAGE_KEY = 'cilspro-language';

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return (stored as Language) || defaultLanguage;
    }
    return defaultLanguage;
  });

  const changeLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const t = (key: keyof Translations): string => {
    return getTranslation(currentLanguage, key);
  };

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  }, [currentLanguage]);

  return {
    currentLanguage,
    changeLanguage,
    t
  };
}