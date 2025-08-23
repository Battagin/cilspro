import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const LetturaPage = () => {
  const subtypes = [
    {
      id: 'comprensione',
      title: 'Comprensione della Lettura',
      description: 'Leggi testi autentici e rispondi a domande di comprensione',
      icon: BookOpen,
      path: '/esercizi/lettura/comprensione'
    },
    {
      id: 'grammatica',
      title: 'Analisi Grammaticale',
      description: 'Esercizi mirati su strutture grammaticali e lessico',
      icon: FileText,
      path: '/esercizi/lettura/grammatica'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Link to="/esercizi">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna agli esercizi
              </Button>
            </Link>
          </div>

          <div className="text-center space-y-6 mb-12">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-10 h-10" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Lettura
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Scegli il tipo di esercizio di lettura che vuoi praticare
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {subtypes.map((subtype) => (
              <Link key={subtype.id} to={subtype.path}>
                <Card className="group hover:shadow-elegant transition-smooth cursor-pointer h-full">
                  <CardHeader className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-bounce">
                      <subtype.icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-xl">{subtype.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground text-sm">{subtype.description}</p>
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

export default LetturaPage;