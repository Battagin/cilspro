import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Target, Users, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              {t("about")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              CILSpro è la piattaforma di preparazione online più avanzata per l'esame CILS B1 Cittadinanza, 
              con sede a Vicenza, Italia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">La Nostra Missione</h2>
              <p className="text-muted-foreground leading-relaxed">
                Aiutiamo migliaia di persone a realizzare il sogno della cittadinanza italiana 
                attraverso una preparazione efficace e moderna per l'esame CILS B1. 
                La nostra metodologia combina tecnologia avanzata con pedagogia scientifica.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Con sede a Vicenza, nel cuore del Veneto, comprendiamo perfettamente le sfide 
                che affrontano coloro che desiderano ottenere la cittadinanza italiana.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">5000+</div>
                  <div className="text-sm text-muted-foreground">Studenti Approvati</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">92%</div>
                  <div className="text-sm text-muted-foreground">Tasso di Successo</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Target className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">1000+</div>
                  <div className="text-sm text-muted-foreground">Esercizi Ufficiali</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">100%</div>
                  <div className="text-sm text-muted-foreground">Formato Ufficiale</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="hover:shadow-elegant transition-smooth">
              <CardHeader>
                <Award className="w-10 h-10 text-secondary mb-4" />
                <CardTitle>Metodologia Scientifica</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Le nostre simulazioni seguono rigorosamente il formato ufficiale CILS B1, 
                  garantendo una preparazione autentica e mirata.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-elegant transition-smooth">
              <CardHeader>
                <Target className="w-10 h-10 text-primary mb-4" />
                <CardTitle>IA Avanzata</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Utilizziamo intelligenza artificiale all'avanguardia per fornire correzioni 
                  precise e feedback personalizzato su scrittura e pronuncia.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-elegant transition-smooth">
              <CardHeader>
                <Users className="w-10 h-10 text-secondary mb-4" />
                <CardTitle>Supporto Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Il nostro team di esperti linguistici offre supporto continuo e 
                  strategie personalizzate per ogni studente.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Perché Scegliere CILSpro?
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Siamo l'unica piattaforma che combina simulazioni autentiche CILS con 
              tecnologia IA avanzata, offrendo un'esperienza di apprendimento 
              personalizzata e efficace.
            </p>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-primary">4</div>
                <div className="text-sm text-muted-foreground">Competenze CILS</div>
              </div>
              <div>
                <div className="text-xl font-bold text-secondary">24/7</div>
                <div className="text-sm text-muted-foreground">Accesso Piattaforma</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">30 giorni</div>
                <div className="text-sm text-muted-foreground">Garanzia</div>
              </div>
              <div>
                <div className="text-xl font-bold text-secondary">Vicenza</div>
                <div className="text-sm text-muted-foreground">Italia</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;