import { Button } from "@/components/ui/button";
import { BookOpen, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="p-2 bg-gradient-hero rounded-lg shadow-card">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold">
            <span className="text-primary">CILS</span>
            <span className="text-secondary font-light">pro</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-foreground hover:text-primary transition-smooth font-medium">
            Funzionalità
          </a>
          <Link to="/piani" className="text-foreground hover:text-primary transition-smooth font-medium">
            {t("plans")}
          </Link>
          <Link to="/chi-siamo" className="text-foreground hover:text-primary transition-smooth font-medium">
            {t("about")}
          </Link>
          <Link to="/contatti" className="text-foreground hover:text-primary transition-smooth font-medium">
            {t("contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSelector />
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>
                {t("logout")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <User className="w-4 h-4 mr-2" />
                  {t("login")}
                </Button>
              </Link>
              <Link to="/registrazione">
                <Button variant="hero" size="sm">
                  {t("register")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;