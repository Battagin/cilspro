import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, BookOpen, PenTool, Mic, Play, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Demo = () => {
  const { t } = useLanguage();

  const demoSimulations = [
    {
      icon: Headphones,
      title: t("ascolto"),
      description: "Ascolta un dialogo breve e rispondi alle domande",
      duration: "15 min",
      questions: "10 domande",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: BookOpen,
      title: t("lettura"),
      description: "Leggi un testo autentico e completa gli esercizi",
      duration: "20 min", 
      questions: "15 domande",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: PenTool,
      title: t("scrittura"),
      description: "Scrivi un testo seguendo le istruzioni fornite",
      duration: "30 min",
      questions: "1 compito",
      color: "bg-orange-50 text-orange-600"
    },
    {
      icon: Mic,
      title: t("produzione_orale"),
      description: "Registra la tua risposta orale su un tema dato",
      duration: "10 min",
      questions: "2 compiti",
      color: "bg-red-50 text-red-600"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Simulazione Demo CILS B1
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Prova gratuitamente esempi delle 4 competenze dell'esame CILS B1 Cittadinanza. 
              Scopri la qualità dei nostri contenuti prima di iscriverti.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {demoSimulations.map((simulation, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-smooth">
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${simulation.color} flex items-center justify-center`}>
                      <simulation.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{simulation.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {simulation.duration}
                        </span>
                        <span>{simulation.questions}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{simulation.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Demo in arrivo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-6">
            <div className="bg-muted/50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Vuoi accedere alle simulazioni complete?
              </h3>
              <p className="text-muted-foreground mb-6">
                Registrati gratuitamente per accedere a simulazioni complete con correzione automatica IA
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/registrazione">
                  <Button variant="hero" size="lg">
                    {t("startFreePrep")}
                  </Button>
                </Link>
                <Link to="/piani">
                  <Button variant="outline" size="lg">
                    {t("tryAllFeatures")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Demo;