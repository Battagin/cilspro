import { Button } from "@/components/ui/button";
import { useLanguage, type Language } from "@/hooks/useLanguage";

const languages = [
  { code: 'it' as Language, flag: '🇮🇹', name: 'Italiano' },
  { code: 'en' as Language, flag: '🇬🇧', name: 'English' },
  { code: 'pt' as Language, flag: '🇧🇷', name: 'Português' }
];

interface LanguageSelectorProps {
  variant?: "compact" | "full";
}

export function LanguageSelector({ variant = "compact" }: LanguageSelectorProps) {
  const { currentLanguage, changeLanguage } = useLanguage();

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={currentLanguage === lang.code ? "secondary" : "ghost"}
            size="sm"
            className="px-2 py-1 h-8"
            onClick={() => changeLanguage(lang.code)}
          >
            <span className="text-sm">{lang.flag}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-muted-foreground">Idioma / Language</p>
      <div className="flex gap-2">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={currentLanguage === lang.code ? "secondary" : "outline"}
            className="flex items-center gap-2"
            onClick={() => changeLanguage(lang.code)}
          >
            <span>{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}