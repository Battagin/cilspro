import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, BookOpen, PenTool, Mic, Lock, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const FreeTraining = () => {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/registrazione");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">{t("loading")}</div>
    </div>;
  }

  if (!user) return null;

  const freeExercises = [
    {
      icon: Headphones,
      title: t("ascolto"),
      description: "3 esercizi gratuiti di comprensione orale",
      available: 3,
      total: 50,
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: BookOpen, 
      title: t("lettura"),
      description: "5 testi di comprensione scritta gratuiti",
      available: 5,
      total: 60,
      color: "bg-green-50 text-green-600"
    },
    {
      icon: PenTool,
      title: t("scrittura"),
      description: "2 compiti di scrittura con correzione base",
      available: 2,
      total: 40,
      color: "bg-orange-50 text-orange-600"
    },
    {
      icon: Mic,
      title: t("produzione_orale"),
      description: "1 simulazione di produzione orale",
      available: 1,
      total: 30,
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
              Allenamento Gratuito
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Inizia la tua preparazione CILS B1 con i nostri esercizi gratuiti. 
              Sblocca tutto il contenuto premium con un abbonamento.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {freeExercises.map((exercise, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-smooth">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${exercise.color} flex items-center justify-center`}>
                        <exercise.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{exercise.title}</h3>
                        <span className="text-sm text-muted-foreground">
                          {exercise.available} di {exercise.total} esercizi
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-full">
                      <span className="text-xs font-medium text-secondary">GRATUITI</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{exercise.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      disabled
                    >
                      Inizia Esercizi
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="px-3"
                    >
                      <Lock className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(exercise.available / exercise.total) * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-center">
                  <Crown className="w-16 h-16 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Sblocca Tutto il Contenuto Premium
                </h3>
                <p className="text-muted-foreground">
                  Accedi a oltre 180 esercizi, simulazioni complete con timer, 
                  correzione IA avanzata e molto altro con un abbonamento premium.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/piani">
                    <Button variant="hero" size="lg">
                      <Crown className="w-4 h-4 mr-2" />
                      Diventa Premium
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" size="lg">
                      Torna al Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FreeTraining;