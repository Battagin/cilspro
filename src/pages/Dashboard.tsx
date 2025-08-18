import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Headphones, Eye, PenTool, Mic, LogOut, BarChart3, TrendingUp, Play, CheckCircle, Clock } from "lucide-react";
import ProgressChart from "@/components/ProgressChart";

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<"7days" | "30days">("7days");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const competencies = [
    {
      name: t("ascolto"),
      icon: Headphones,
      progress: 75,
      errors: ["Identificazione del tema principale", "Comprensione di dettagli specifici"],
    },
    {
      name: t("lettura"),
      icon: Eye,
      progress: 68,
      errors: ["Collegamento tra informazioni", "Comprensione del lessico specifico"],
    },
    {
      name: t("scrittura"),
      icon: PenTool,
      progress: 62,
      errors: ["Coerenza testuale", "Uso corretto dei connettivi", "Strutture grammaticali complesse"],
    },
    {
      name: t("produzione_orale"),
      icon: Mic,
      progress: 70,
      errors: ["Fluenza espositiva", "Pronuncia di suoni specifici"],
    },
  ];

  const availableSimulations = [
    {
      title: "Simulazione Completa CILS B1",
      description: "Test completo con tutte e 4 le competenze",
      duration: "3 ore",
      competencies: ["Ascolto", "Lettura", "Scrittura", "Produzione Orale"],
      icon: BookOpen,
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Benvenuto, {user.user_metadata?.display_name || user.email}!
            </h1>
            <p className="text-muted-foreground">Continua la tua preparazione per la CILS B1 Cittadinanza</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              {t("logout")}
            </Button>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ProgressChart period={selectedPeriod} />
          </div>
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Periodo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  variant={selectedPeriod === "7days" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedPeriod("7days")}
                >
                  Ultimi 7 giorni
                </Button>
                <Button
                  variant={selectedPeriod === "30days" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedPeriod("30days")}
                >
                  Ultimi 30 giorni
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-elegant transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Simulazioni Completate</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Studio</p>
                  <p className="text-2xl font-bold text-foreground">28h</p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Media Generale</p>
                  <p className="text-2xl font-bold text-foreground">69%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progresso</p>
                  <p className="text-2xl font-bold text-foreground">+12%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competencies Progress */}
        <Card className="mb-8 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Le 4 Competenze CILS B1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {competencies.map((competency, index) => {
                const Icon = competency.icon;
                return (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-secondary" />
                        <span className="font-medium">{competency.name}</span>
                      </div>
                      <Badge variant="secondary">{competency.progress}%</Badge>
                    </div>
                    <Progress value={competency.progress} className="h-2" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Errori tipici:</p>
                      <ul className="space-y-1">
                        {competency.errors.map((error, errorIndex) => (
                          <li key={errorIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full flex-shrink-0" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Available Simulations */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Simulazioni Disponibili
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableSimulations.map((simulation, index) => {
                const Icon = simulation.icon;
                return (
                  <div key={index} className="border border-border rounded-lg p-4 hover:shadow-elegant transition-smooth">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-foreground">{simulation.title}</h3>
                          <p className="text-sm text-muted-foreground">{simulation.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {simulation.duration}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {simulation.competencies.map((comp, compIndex) => (
                              <Badge key={compIndex} variant="outline">
                                {comp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button>
                        <Play className="w-4 h-4 mr-2" />
                        Inizia
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;