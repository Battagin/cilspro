import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Abbonamenti = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const piani = [
    {
      nome: "Base",
      prezzo: "€9.99",
      periodo: "al mese",
      descrizione: "Perfetto per iniziare la tua preparazione CILS",
      caratteristiche: [
        "Accesso a 5 simulazioni complete",
        "Esercizi di base per tutte le competenze",
        "Correzione automatica",
        "Supporto via email"
      ],
      popolare: false,
      envVar: "VITE_PAYMENT_LINK_BASE"
    },
    {
      nome: "Pro",
      prezzo: "€19.99",
      periodo: "al mese",
      descrizione: "La scelta più popolare per una preparazione completa",
      caratteristiche: [
        "Accesso illimitato a tutte le simulazioni",
        "Esercizi avanzati e personalizzati",
        "Correzione con IA avanzata",
        "Analisi dettagliata dei progressi",
        "Supporto prioritario",
        "Materiali di studio esclusivi"
      ],
      popolare: true,
      envVar: "VITE_PAYMENT_LINK_PRO"
    },
    {
      nome: "Enterprise",
      prezzo: "€39.99",
      periodo: "al mese",
      descrizione: "Per scuole e centri di formazione",
      caratteristiche: [
        "Tutto del piano Pro",
        "Gestione multi-utente",
        "Dashboard amministratore",
        "Report dettagliati per gruppo",
        "Supporto dedicato 24/7",
        "Personalizzazione avanzata",
        "API per integrazioni"
      ],
      popolare: false,
      envVar: "VITE_PAYMENT_LINK_ENTERPRISE"
    }
  ];

  const handleAbbonati = (piano: typeof piani[0]) => {
    const paymentLink = import.meta.env[piano.envVar];
    
    if (paymentLink) {
      window.location.href = paymentLink;
    } else {
      toast({
        title: "Configurazione necessaria",
        description: `Configura il link di pagamento per il piano ${piano.nome} nel file .env`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Abbonamenti
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Scegli il piano perfetto per la tua preparazione CILS B1 Cittadinanza
            </p>
            {user && (
              <p className="text-lg text-primary mt-4">
                Ciao, {user.email}! Scegli il tuo piano ideale.
              </p>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {piani.map((piano, index) => (
              <Card 
                key={index} 
                className={`relative ${piano.popolare ? 'border-primary shadow-elegant scale-105' : ''}`}
              >
                {piano.popolare && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Più Popolare
                  </Badge>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl">{piano.nome}</CardTitle>
                  <CardDescription>{piano.descrizione}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">{piano.prezzo}</span>
                    <span className="text-muted-foreground">/{piano.periodo}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {piano.caratteristiche.map((caratteristica, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-foreground">{caratteristica}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={`w-full ${piano.popolare ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={piano.popolare ? 'default' : 'outline'}
                    onClick={() => handleAbbonati(piano)}
                  >
                    Abbonati al Piano {piano.nome}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <div className="text-center mt-16 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Garanzia di 30 giorni</h3>
            <p className="text-muted-foreground mb-8">
              Non sei soddisfatto? Ricevi un rimborso completo entro 30 giorni dall'acquisto.
              Puoi cancellare il tuo abbonamento in qualsiasi momento.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-6">
              <h4 className="text-lg font-medium mb-2">Tutti i piani includono:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Accesso immediato alla piattaforma</li>
                <li>• Aggiornamenti automatici dei contenuti</li>
                <li>• Certificato di completamento</li>
                <li>• Accesso da qualsiasi dispositivo</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Abbonamenti;