import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Headphones, BookOpen, PenTool, Mic, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  answer_key?: any; // Optional since public view doesn't include this
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
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [exercises, setExercises] = useState<DemoExercise[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<SkillResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId] = useState(() => crypto.randomUUID());

  const skillOrder = ['ascolto', 'lettura', 'scrittura', 'produzione_orale'];
  const timeLimits = {
    ascolto: 480, // 8 minuti
    lettura: 600, // 10 minuti  
    scrittura: 1200, // 20 minuti
    produzione_orale: 600 // 10 minuti
  };

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/demo');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadExercises();
    }
  }, [user]);

  const loadExercises = async () => {
    try {
      const response = await fetch('/api/demo/list');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load exercises');
      }

      // Transform API data to match component interface
      const transformedExercises = data.items.map((item: any) => ({
        id: item.id,
        skill_type: item.type,
        title: item.title,
        content: {
          prompt_it: item.prompt_it,
          audio_url: item.audio_url,
          text_it: item.text_it,
          timer_seconds: item.timer_seconds,
          questions: item.questions || [],
          min_words: item.min_words,
          max_words: item.max_words
        }
      }));

      setExercises(transformedExercises);
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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
              <div className="grid gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null;
  }

  // Show empty state if no exercises
  if (!isLoading && exercises.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Demo CILS B1
              </h1>
              <div className="bg-muted/50 p-8 rounded-xl">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Nessun esercizio demo disponibile
                </h2>
                <p className="text-muted-foreground mb-6">
                  Riprova più tardi.
                </p>
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                  Torna al Dashboard
                </Button>
              </div>
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
          {exercises.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">
                  Progresso: {results.length} di {exercises.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {exercises.length > 0 ? Math.round((results.length / exercises.length) * 100) : 0}%
                </span>
              </div>
              <Progress value={exercises.length > 0 ? (results.length / exercises.length) * 100 : 0} />
            </div>
          )}

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
                  timeLimit={currentExercise.content?.timer_seconds || timeLimits.ascolto}
                />
              )}
              {currentSkill === 'lettura' && (
                <ReadingSection
                  exercise={currentExercise}
                  onComplete={handleStepComplete}
                  timeLimit={currentExercise.content?.timer_seconds || timeLimits.lettura}
                />
              )}
              {currentSkill === 'scrittura' && (
                <WritingSection
                  exercise={currentExercise}
                  onComplete={handleStepComplete}
                  timeLimit={currentExercise.content?.timer_seconds || timeLimits.scrittura}
                />
              )}
              {currentSkill === 'produzione_orale' && (
                <SpeakingSection
                  exercise={currentExercise}
                  onComplete={handleStepComplete}
                  timeLimit={currentExercise.content?.timer_seconds || timeLimits.produzione_orale}
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