import { Button } from "@/components/ui/button";
import { Award, CheckCircle, Globe, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
// Use the uploaded hero image
const heroImage = "/lovable-uploads/01804f8b-c746-4b85-ad1c-000468e3712f.png";

const Hero = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-background via-muted/20 to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium">
                <Award className="w-4 h-4" />
                Preparazione Ufficiale CILS B1 Cittadinanza
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                {t("heroTitle")}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t("heroSubtitle")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={user ? "/allenamento-gratuito" : "/registrazione"}>
                <Button variant="hero" size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                  {t("startFreePrep")}
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                  🎯 Inizia Simulazione Esame Completo
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium text-muted-foreground">
                  +1000 esercizi ufficiali
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Correzione automatica IA
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium text-muted-foreground">
                  +5000 studenti approvati
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Simulazione 100% ufficiale
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-elegant">
              <img 
                src={heroImage} 
                alt="Preparazione per cittadinanza italiana - CILSpro"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              
              {/* The new image already has the CILSpro logo on the laptop screen */}
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-card border">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-foreground">
                  92% tasso di approvazione
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;