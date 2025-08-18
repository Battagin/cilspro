import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Headphones, Eye, PenTool, Mic, LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

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
      color: "bg-blue-500",
    },
    {
      name: t("lettura"),
      icon: Eye,
      progress: 60,
      color: "bg-green-500",
    },
    {
      name: t("scrittura"),
      icon: PenTool,
      progress: 45,
      color: "bg-orange-500",
    },
    {
      name: t("produzione_orale"),
      icon: Mic,
      progress: 30,
      color: "bg-purple-500",
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-hero rounded-lg shadow-card">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard CILSpro
              </h1>
              <p className="text-muted-foreground">
                Benvenuto, {user.user_metadata?.display_name || user.email}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            {t("logout")}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {competencies.map((competency, index) => {
            const Icon = competency.icon;
            return (
              <Card key={index} className="hover:shadow-elegant transition-smooth">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${competency.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{competency.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span className="font-medium">{competency.progress}%</span>
                    </div>
                    <Progress value={competency.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Simulazioni Disponibili</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Simulazione Completa CILS B1
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Headphones className="w-4 h-4 mr-2" />
                Esercizi di Ascolto
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <PenTool className="w-4 h-4 mr-2" />
                Scrittura e Strutture
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Statistiche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Simulazioni completate</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Media generale</span>
                <span className="font-medium text-secondary">78%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tempo di studio</span>
                <span className="font-medium">24h 30m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livello attuale</span>
                <span className="font-medium text-primary">B1 Intermedio</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;