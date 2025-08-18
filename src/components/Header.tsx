import { Button } from "@/components/ui/button";
import { BookOpen, User } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-hero rounded-lg shadow-card">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold">
            <span className="text-primary">CILS</span>
            <span className="text-secondary font-light">pro</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-foreground hover:text-primary transition-smooth font-medium">
            Funcionalidades
          </a>
          <a href="#pricing" className="text-foreground hover:text-primary transition-smooth font-medium">
            Planos
          </a>
          <a href="#about" className="text-foreground hover:text-primary transition-smooth font-medium">
            Sobre
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <User className="w-4 h-4 mr-2" />
            Entrar
          </Button>
          <Button variant="hero" size="sm">
            Começar Agora
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;