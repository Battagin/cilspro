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

const Features = () => {
  const skills = [
    {
      icon: Headphones,
      title: "Ascolto",
      description: "Áudios oficiais com limite de 2 escutas, questões de múltipla escolha e verdadeiro/falso",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: BookOpen,
      title: "Lettura",
      description: "Textos curtos autênticos com exercícios de compreensão no estilo oficial CILS",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: PenTool,
      title: "Strutture",
      description: "Exercícios de gramática e uso da língua com feedback detalhado e explicações",
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: PenTool,
      title: "Scrittura",
      description: "Redações corrigidas por IA seguindo a rubrica oficial CILS com pontuação detalhada",
      color: "bg-orange-50 text-orange-600"
    },
    {
      icon: Mic,
      title: "Orale",
      description: "Gravação no navegador com avaliação automática de pronúncia e fluência",
      color: "bg-red-50 text-red-600"
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "IA Avançada",
      description: "Correção automática com ChatGPT e feedback personalizado para cada competência"
    },
    {
      icon: BarChart,
      title: "Progresso Detalhado",
      description: "Dashboard completo com histórico de simulados e percentual por habilidade"
    },
    {
      icon: Clock,
      title: "Timer Oficial",
      description: "Simulação das condições reais da prova com controle de tempo por seção"
    },
    {
      icon: Target,
      title: "Foco na Cittadinanza",
      description: "Conteúdo específico para cidadania: trabalho, saúde, serviços públicos"
    },
    {
      icon: Zap,
      title: "Feedback Imediato",
      description: "Correção instantânea com sugestões personalizadas para melhorar"
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            As 5 Competências do 
            <span className="bg-gradient-hero bg-clip-text text-transparent"> CILS B1</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Treine todas as habilidades exigidas no exame oficial com simulados 
            completos e exercícios específicos para cada competência.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-20">
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
            Recursos Premium
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
          <Button variant="feature" size="lg" className="text-lg px-8 py-6">
            Testar Todas as Funcionalidades
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;