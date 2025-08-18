import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic, 
  Brain, 
  BarChart, 
  Clock, 
  Target,
  Zap
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";

const Features = () => {
  const { t } = useLanguage();
  
  const skills = [
    {
      icon: Headphones,
      title: t("ascolto"),
      description: "Audio ufficiali con limite di 2 ascolti, domande a scelta multipla e vero/falso",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: BookOpen,
      title: t("lettura"),
      description: "Testi brevi autentici con esercizi di comprensione in stile ufficiale CILS",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: PenTool,
      title: t("scrittura"),
      description: "Testi corretti dall'IA seguendo la rubrica ufficiale CILS con punteggio dettagliato. Include strutture grammaticali.",
      color: "bg-orange-50 text-orange-600"
    },
    {
      icon: Mic,
      title: t("produzione_orale"),
      description: "Registrazione nel browser con valutazione automatica di pronuncia e fluenza",
      color: "bg-red-50 text-red-600"
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "Simulazioni temporizzate in stile CILS",
      description: "Timer ufficiale che simula le condizioni reali dell'esame con controllo del tempo per sezione"
    },
    {
      icon: BarChart,
      title: "Correzione con IA per scrittura e orale",
      description: "Correzione automatica avanzata con feedback personalizzato per ogni competenza"
    },
    {
      icon: Clock,
      title: "Report di progresso per competenza",
      description: "Dashboard completo con storico delle simulazioni e percentuali per abilità"
    },
    {
      icon: Target,
      title: "Flashcard e quiz mirati al lessico di cittadinanza",
      description: "Contenuto specifico per cittadinanza: lavoro, salute, servizi pubblici"
    },
    {
      icon: Zap,
      title: "Accesso illimitato ai contenuti per abbonati",
      description: "Oltre 180 esercizi e simulazioni complete sempre disponibili"
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Le 4 competenze della 
            <span className="bg-gradient-hero bg-clip-text text-transparent"> CILS B1</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Allena tutte le abilità richieste dall'esame ufficiale con simulazioni 
            complete ed esercizi mirati.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {skills.map((skill, index) => (
            <Card key={index} className="group hover:shadow-elegant transition-smooth cursor-pointer">
              <CardHeader className="text-center space-y-4">
                <div className={`w-16 h-16 rounded-full ${skill.color} flex items-center justify-center mx-auto group-hover:scale-110 transition-bounce`}>
                  <skill.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{skill.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm leading-relaxed">
                  {skill.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-12">
          <h3 className="text-3xl font-bold text-center text-foreground">
            Funzionalità Premium
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4 p-6 bg-card rounded-xl shadow-card hover:shadow-elegant transition-smooth">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-feature rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <Link to="/piani">
            <Button variant="feature" size="lg" className="text-lg px-8 py-6">
              {t("tryAllFeatures")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;