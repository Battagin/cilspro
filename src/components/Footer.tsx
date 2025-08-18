import { BookOpen, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold">
                <span className="text-white">CILS</span>
                <span className="text-secondary font-light">pro</span>
              </div>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              La piattaforma più completa per la preparazione all'esame CILS B1 Cittadinanza. Ottieni la tua cittadinanza con sicurezza.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Piattaforma</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/#features" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Funzionalità</Link></li>
              <li><Link to="/piani" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Piani</Link></li>
              <li><Link to="/demo" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Simulazioni</Link></li>
              <li><Link to="/allenamento-gratuito" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Esercizi</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Supporto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Centro assistenza</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-secondary transition-smooth">FAQ</a></li>
              <li><Link to="/contatti" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Contatti</Link></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Blog</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contatti</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/80">contatto@cilspro.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/80">+39 000 000 0000</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/80">Vicenza, Italia</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © 2025 CILSpro. Tutti i diritti riservati.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-primary-foreground/80 hover:text-secondary transition-smooth">
              Privacy
            </Link>
            <Link to="/termini" className="text-primary-foreground/80 hover:text-secondary transition-smooth">
              Termini d'uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;