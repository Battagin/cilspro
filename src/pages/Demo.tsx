import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Headphones, BookOpen, PenTool, Mic, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

import ListeningSection from '@/components/demo/ListeningSection';
import ReadingSection from '@/components/demo/ReadingSection';
import WritingSection from '@/components/demo/WritingSection';
import SpeakingSection from '@/components/demo/SpeakingSection';
import DemoResults from '@/components/demo/DemoResults';

interface DemoExercise {
  id: string;
  skill_type: string;
  title: string;
  content: any;
  answer_key: any;
}

interface SkillResult {
  skill: string;
  score: number;
  feedback?: string;
  criteria?: Record<string, number>;
  answers?: any;
}

const Demo = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [exercises, setExercises] = useState<DemoExercise[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<SkillResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId] = useState(() => crypto.randomUUID());

  const skillOrder = ['ascolto', 'lettura', 'scrittura', 'produzione_orale'];
  const timeLimits = {
    ascolto: 900, // 15 minuti
    lettura: 1200, // 20 minuti
    scrittura: 1800, // 30 minuti
    produzione_orale: 600 // 10 minuti
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('demo_exercises')
        .select('*')
        .order('skill_type');

      if (error) throw error;

      // Sort exercises by skill order
      const sortedExercises = skillOrder.map(skill => 
        data.find(ex => ex.skill_type === skill)
      ).filter(Boolean) as DemoExercise[];

      setExercises(sortedExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli esercizi. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepComplete = (answers: any, score: number, evaluation?: any) => {
    const currentExercise = exercises[currentStep];
    const skillResult: SkillResult = {
      skill: currentExercise.skill_type,
      score,
      answers,
      ...(evaluation && {
        feedback: evaluation.feedback,
        criteria: evaluation.criteria
      })
    };

    setResults(prev => [...prev, skillResult]);
    
    if (currentStep < exercises.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // All exercises completed, save results
      saveResults([...results, skillResult]);
    }
  };

  const saveResults = async (finalResults: SkillResult[]) => {
    try {
      const totalScore = Math.round(
        finalResults.reduce((sum, result) => sum + result.score, 0) / finalResults.length
      );

      const { error } = await supabase
        .from('demo_attempts')
        .insert({
          user_id: user?.id,
          session_id: sessionId,
          total_score: totalScore,
          results: finalResults as any
        });

      if (error) throw error;

      toast({
        title: "Simulazione completata!",
        description: "I tuoi risultati sono stati salvati."
      });
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const restartDemo = () => {
    setCurrentStep(0);
    setResults([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Caricamento simulazione...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show results if all exercises completed
  if (results.length === exercises.length && exercises.length > 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <DemoResults results={results} onRestart={restartDemo} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentExercise = exercises[currentStep];
  const currentSkill = currentExercise?.skill_type;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center space-y-6 mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Simulazione Demo CILS B1
            </h1>
            <p className="text-xl text-muted-foreground">
              Simulazione gratuita delle 4 competenze dell'esame CILS B1 Cittadinanza
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">
                Progresso: {currentStep + 1} di {exercises.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(((currentStep + 1) / exercises.length) * 100)}%
              </span>
            </div>
            <Progress value={((currentStep + 1) / exercises.length) * 100} />
          </div>

          {/* Step indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {skillOrder.map((skill, index) => {
                const Icon = {
                  ascolto: Headphones,
                  lettura: BookOpen,
                  scrittura: PenTool,
                  produzione_orale: Mic
                }[skill];

                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div key={skill} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-600 text-white' 
                        : isCurrent 
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {index < skillOrder.length - 1 && (
                      <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current exercise */}
          {currentExercise && (
            <div className="mb-8">
              {currentSkill === 'ascolto' && (
                <ListeningSection
                  exercise={currentExercise}
                  onComplete={handleStepComplete}
                  timeLimit={timeLimits.ascolto}
                />
              )}
              {currentSkill === 'lettura' && (
                <ReadingSection
                  exercise={currentExercise}
                  onComplete={handleStepComplete}
                  timeLimit={timeLimits.lettura}
                />
              )}
              {currentSkill === 'scrittura' && (
                <WritingSection
                  exercise={currentExercise}
                  onComplete={handleStepComplete}
                  timeLimit={timeLimits.scrittura}
                />
              )}
              {currentSkill === 'produzione_orale' && (
                <SpeakingSection
                  exercise={currentExercise}
                  onComplete={handleStepComplete}
                  timeLimit={timeLimits.produzione_orale}
                />
              )}
            </div>
          )}

          <div className="text-center space-y-6">
            <div className="bg-muted/50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-foreground mb-2">
                ✨ Questa è solo l'anteprima!
              </h3>
              <p className="text-muted-foreground mb-4">
                Accedi a simulazioni complete, feedback dettagliati e tracciamento progressi
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/registrazione">
                  <Button variant="hero" size="lg">
                    {t("startFreePrep")}
                  </Button>
                </Link>
                <Link to="/piani">
                  <Button variant="outline" size="lg">
                    {t("tryAllFeatures")}
                  </Button>
                </Link>
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