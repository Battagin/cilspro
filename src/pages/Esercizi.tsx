import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, BookOpen, PenTool, Mic, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const Esercizi = () => {
  const { t } = useLanguage();
  
  const skills = [
    {
      id: 'ascolto',
      icon: Headphones,
      title: t("ascolto"),
      description: "Comprensione dell'ascolto con audio autentici",
      color: "bg-blue-50 text-blue-600",
      path: "/esercizi/ascolto"
    },
    {
      id: 'lettura',
      icon: BookOpen,
      title: t("lettura"),
      description: "Comprensione della lettura e analisi grammaticale",
      color: "bg-green-50 text-green-600",
      path: "/esercizi/lettura"
    },
    {
      id: 'scrittura',
      icon: PenTool,
      title: t("scrittura"),
      description: "Produzione scritta con correzione IA",
      color: "bg-orange-50 text-orange-600",
      path: "/esercizi/scrittura"
    },
    {
      id: 'orale',
      icon: Mic,
      title: t("produzione_orale"),
      description: "Produzione orale con valutazione automatica",
      color: "bg-red-50 text-red-600",
      path: "/esercizi/orale"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Esercitati
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Scegli la competenza su cui vuoi allenarti per l'esame CILS B1 Cittadinanza
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {skills.map((skill) => (
              <Link key={skill.id} to={skill.path}>
                <Card className="group hover:shadow-elegant transition-smooth cursor-pointer h-full">
                  <CardHeader className="text-center space-y-4">
                    <div className={`w-20 h-20 rounded-full ${skill.color} flex items-center justify-center mx-auto group-hover:scale-110 transition-bounce`}>
                      <skill.icon className="w-10 h-10" />
                    </div>
                    <CardTitle className="text-2xl">{skill.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">{skill.description}</p>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      Inizia
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Esercizi;