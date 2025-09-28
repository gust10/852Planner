import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import UserMenu from "@/components/UserMenu";
import { useTranslations } from "@/hooks/useTranslations";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();

  return (
    <div className="h-screen bg-gradient-hero flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Logo in top left */}
      <div className="absolute top-6 left-6 z-10">
        <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
      </div>

      {/* Header with User Menu and Language Selector */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-4">
        <UserMenu />
        <LanguageSelector />
      </div>

      <div className="text-center max-w-2xl space-y-8">
        {/* Main heading */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground leading-tight">
            HK Wonder<span className="text-red-500">Plan</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            {t('main.description')}
          </p>
        </div>
        
        {/* Call to action */}
        <Button 
          size="lg"
          onClick={() => navigate("/survey")}
          className="neon-button py-4 px-8 text-lg font-semibold rounded-xl shadow-elevated"
        >
          {t('main.cta')}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
