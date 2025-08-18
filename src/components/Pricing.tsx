import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Gratuito",
      price: "0",
      period: "para sempre",
      description: "Ideal para conhecer a plataforma",
      features: [
        "3 simulados completos",
        "50 exercícios extras",
        "Feedback básico",
        "Progresso limitado"
      ],
      buttonText: "Começar Grátis",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Premium",
      price: "39",
      period: "/mês",
      description: "Preparação completa para aprovação",
      features: [
        "Simulados ilimitados",
        "1000+ exercícios extras",
        "Correção IA avançada",
        "Relatórios detalhados em PDF",
        "Histórico completo",
        "Suporte prioritário"
      ],
      buttonText: "Assinar Premium",
      buttonVariant: "hero" as const,
      popular: true
    },
    {
      name: "Anual",
      price: "29",
      period: "/mês",
      originalPrice: "39",
      description: "Economia de 25% no plano anual",
      features: [
        "Tudo do Premium",
        "Acesso à comunidade VIP",
        "Sessões de prática ao vivo",
        "Consultoria personalizada",
        "Material extra em PDF",
        "Garantia de aprovação"
      ],
      buttonText: "Assinar Anual",
      buttonVariant: "feature" as const,
      popular: false,
      badge: "Melhor Valor"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Escolha seu
            <span className="bg-gradient-hero bg-clip-text text-transparent"> plano ideal</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comece gratuitamente e evolua para recursos premium conforme sua necessidade
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
                    Mais Popular
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
                        R$ {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-foreground">R$ {plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
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
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16 space-y-4">
          <p className="text-muted-foreground">
            Todos os planos incluem <strong>garantia de 30 dias</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Cancele a qualquer momento • Sem taxa de setup • Suporte 24/7
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;