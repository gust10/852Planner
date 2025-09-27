import { useLanguage } from '@/contexts/LanguageContext';
import { translations, TranslationKey } from '@/translations';

export const useTranslations = () => {
  const { currentLanguage } = useLanguage();
  
  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    let text = translations[currentLanguage.code as keyof typeof translations]?.[key] || translations.en[key];
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{${paramKey}}`, String(value));
      });
    }
    
    return text;
  };
  
  return { t };
};