import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

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
              A plataforma mais completa para preparação do exame CILS B1 Cittadinanza. 
              Conquiste sua cidadania italiana com confiança.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Plataforma</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Funcionalidades</a></li>
              <li><a href="#pricing" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Planos</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Simulados</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Exercícios</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Central de Ajuda</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-secondary transition-smooth">FAQ</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Contato</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-secondary transition-smooth">Blog</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/80">contato@cilspro.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/80">+55 (11) 9999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/80">São Paulo, Brasil</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 CILSpro. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-primary-foreground/80 hover:text-secondary transition-smooth">
              Política de Privacidade
            </a>
            <a href="#" className="text-primary-foreground/80 hover:text-secondary transition-smooth">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;