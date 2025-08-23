import React from 'react';
import { useParams } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExerciseClient from "@/components/exercises/ExerciseClient";

const DynamicExercisePage = () => {
  const { type, subtype } = useParams<{ type: string; subtype: string }>();

  if (!type || !subtype) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Parametri dell'esercizio mancanti
            </h1>
            <p className="text-muted-foreground">
              Impossibile caricare l'esercizio. Parametri non validi.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <ExerciseClient exerciseType={type} exerciseSubType={subtype} />
      </main>
      <Footer />
    </div>
  );
};

export default DynamicExercisePage;