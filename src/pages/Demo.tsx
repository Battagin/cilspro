import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Headphones, BookOpen, PenTool, Mic } from "lucide-react";

const Demo = () => {
  const navigate = useNavigate();

  const exerciseAreas = [
    {
      id: 'ascolto',
      title: 'Ascolto',
      description: 'Esercizi di comprensione auditiva con dialoghi e testi audio',
      icon: Headphones,
      color: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-200',
      iconColor: 'text-blue-600',
      path: '/esercizi/ascolto/prova_1'
    },
    {
      id: 'lettura',
      title: 'Lettura',
      description: 'Testi autentici e comprensione della lettura',
      icon: BookOpen,
      color: 'bg-green-500/10 hover:bg-green-500/20 border-green-200',
      iconColor: 'text-green-600',
      path: '/esercizi/lettura'
    },
    {
      id: 'scrittura',
      title: 'Scrittura e Strutture',
      description: 'Produzione scritta e analisi grammaticale',
      icon: PenTool,
      color: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-200',
      iconColor: 'text-purple-600',
      path: '/esercizi/scrittura/prova_1'
    },
    {
      id: 'orale',
      title: 'Produzione Orale',
      description: 'Registrazione audio e valutazione della pronuncia',
      icon: Mic,
      color: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-200',
      iconColor: 'text-orange-600',
      path: '/esercizi/orale'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
              CILS B1 Cittadinanza
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Escolha a competência que deseja praticar. Cada seção oferece exercícios específicos com feedback detalhado da IA.
            </p>
          </div>

          {/* 2x2 Grid of Exercise Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {exerciseAreas.map((area) => {
              const Icon = area.icon;
              return (
                <Card 
                  key={area.id}
                  className={`${area.color} border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                  onClick={() => navigate(area.path)}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-background/50 flex items-center justify-center">
                        <Icon className={`w-10 h-10 ${area.iconColor}`} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {area.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {area.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-muted/30 rounded-xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                Como funciona?
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• <strong>Ascolto:</strong> Áudio gerado pela IA, máximo 2 reproduções, questões múltipla escolha</p>
                <p>• <strong>Lettura:</strong> Textos autênticos com exercícios de compreensão</p>
                <p>• <strong>Scrittura:</strong> Correção automática baseada na rubrica oficial CILS</p>
                <p>• <strong>Orale:</strong> Gravação no navegador com avaliação de pronúncia e fluência</p>
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