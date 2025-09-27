import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslations();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
      <div className="text-center p-6 max-w-md mx-auto">
        <h1 className="mb-4 text-4xl font-bold text-foreground">{t('notfound.title')}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t('notfound.description')}</p>
        <a href="/" className="text-primary underline hover:text-primary/80 transition-colors">
          {t('notfound.back')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
