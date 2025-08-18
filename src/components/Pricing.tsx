import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { startCheckoutMensile, startCheckoutAnnuale, startTrial, setAuthDependencies } from "@/services/billing";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const auth = useAuth();
  const { user, session, subscription } = auth;
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  // Set auth dependencies for billing service
  useEffect(() => {
    setAuthDependencies(auth, navigate);
  }, [auth, navigate]);
  
  const plans = [
    {
      name: "Gratuito",
      price: "0",
      period: "per sempre",
      description: "Ideale per conoscere la piattaforma",
      features: [
        "3 simulazioni complete",
        "50 esercizi extra",
        "Feedback di base",
        "Progresso limitato"
      ],
      buttonText: "Inizia gratis",
      buttonVariant: "outline" as const,
      popular: false,
      priceId: null
    },
    {
      name: "Mensile",
      price: "15",
      period: "/mese",
      description: "Preparazione completa per l'approvazione",
      features: [
        "Simulazioni illimitate",
        "1000+ esercizi extra",
        "Correzione IA avanzata",
        "Report dettagliati in PDF",
        "Storico completo",
        "Supporto prioritario"
      ],
      buttonText: subscription.subscription_tier === "Monthly" ? "Piano Attivo" : "Abbonati (Mensile)",
      buttonVariant: subscription.subscription_tier === "Monthly" ? "outline" as const : "hero" as const,
      popular: true,
      priceId: "price_monthly" // Replace with your actual Stripe Price ID
    },
    {
      name: "Annuale",
      price: "10",
      period: "/mese",
      originalPrice: "15",
      yearlyPrice: "120",
      description: "Risparmio del 33% sul piano annuale",
      features: [
        "Tutto del piano Mensile",
        "Accesso alla community VIP",
        "Sessioni di pratica dal vivo",
        "Consulenza personalizzata",
        "Materiale extra in PDF",
        "Garanzia di approvazione"
      ],
      buttonText: subscription.subscription_tier === "Annual" ? "Piano Attivo" : "Abbonati (Annuale)",
      buttonVariant: subscription.subscription_tier === "Annual" ? "outline" as const : "feature" as const,
      popular: false,
      badge: "Più Conveniente",
      priceId: "price_yearly" // Replace with your actual Stripe Price ID
    }
  ];

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) {
      // Handle free plan - navigate directly to demo, no loading
      window.location.href = '/demo';
      return;
    }

    setLoadingPlan(priceId);

    try {
      if (priceId === 'price_monthly') {
        await startCheckoutMensile();
      } else if (priceId === 'price_yearly') {
        await startCheckoutAnnuale();
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Scegli il tuo piano ideale
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Inizia gratuitamente ed evolvi verso le funzionalità premium secondo le tue necessità
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative hover:shadow-elegant transition-smooth ${
                plan.popular ? 'ring-2 ring-secondary shadow-glow' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-feature text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Più Popolare
                  </div>
                </div>
              )}
              
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                    {plan.badge}
                  </div>
                </div>
              )}

              <CardHeader className="text-center space-y-4 pt-8">
                <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                  <div className="space-y-2">
                  <div className="flex items-baseline justify-center gap-2">
                    {plan.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        € {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-foreground">€ {plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.yearlyPrice && (
                    <div className="text-center">
                      <span className="text-lg text-muted-foreground">
                        (€ {plan.yearlyPrice}/anno)
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={plan.buttonVariant} 
                  className="w-full py-6 text-base font-semibold"
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={plan.priceId !== null && (loadingPlan === plan.priceId || (subscription.subscribed && (
                    (plan.name === "Mensile" && subscription.subscription_tier === "Monthly") ||
                    (plan.name === "Annuale" && subscription.subscription_tier === "Annual")
                  )))}
                >
                  {plan.priceId === null ? "Inizia gratis" : (loadingPlan === plan.priceId ? "Elaborando..." : plan.buttonText)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16 space-y-4">
          <p className="text-muted-foreground">
            Tutti i piani includono <strong>garanzia di 7 giorni</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Cancella in qualsiasi momento • Nessuna commissione di setup • Supporto 24/7
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;