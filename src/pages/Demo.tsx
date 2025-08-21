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
import { ExerciseCache } from '@/utils/exerciseCache';

import ListeningSection from '@/components/demo/ListeningSection';
import ReadingSection from '@/components/demo/ReadingSection';
import WritingSection from '@/components/demo/WritingSection';
import SpeakingSection from '@/components/demo/SpeakingSection';
import DemoResults from '@/components/demo/DemoResults';
import { ExamSimulator } from '@/components/demo/ExamSimulator';
import { ExamResults } from '@/components/demo/ExamResults';

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
  const [showSimulator, setShowSimulator] = useState(false);

  const skillOrder = ['ascolto', 'lettura', 'scrittura', 'produzione_orale'];
  const timeLimits = {
    ascolto: 480, // 8 minuti
    lettura: 600, // 10 minuti  
    scrittura: 1200, // 20 minuti
    produzione_orale: 600 // 10 minuti
  };

  // Fallback exercises in case of errors
  const fallbackExercises: DemoExercise[] = [
    {
      id: 'hardcoded_ascolto_1',
      skill_type: 'ascolto',
      title: 'Conversazione al Bar',
      content: {
        prompt_it: "Ascolta il dialogo e rispondi alle domande.",
        audio_url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Hsr2QcBSaO1vPUgC0ELnLG8N+SRAsUVLLn+7VhFgY+ltryxnkpBSB6yu7bjSIEMGvH8N2QQAsTU7Pt6qhXFAlFnN/tr2QdBSaN1/TVgyMFNW/H8N2QQAoUVbPo7bdiFAY9l9vyxnkqBSB6yu7ZjyQFLWbH8N2QQAoUVbTo7LVjFQY9l9vyxHwrBSF6yu7ZjSUENG7H8N2QQAsTUbPn9LdnBSF6yu7bjCQFLWXD8OGXTgoURK3d8K9oFAY',
        timer_seconds: 480,
        questions: [
          { id: 'q1', text: "Cosa ordina Marco?", options: ['A) Espresso e brioche', 'B) Cappuccino e cornetto', 'C) Caffè macchiato', 'D) Tè e biscotti'] },
          { id: 'q2', text: "Quanto paga Marco?", options: ['A) 2 euro e 50', 'B) 3 euro', 'C) 3 euro e 50', 'D) 4 euro'] },
          { id: 'q3', text: "Dove si svolge il dialogo?", options: ['A) In un ristorante', 'B) Al bar', 'C) In una pasticceria', 'D) A casa'] },
          { id: 'q4', text: "Come saluta il barista alla fine?", options: ['A) Buongiorno', 'B) Ciao', 'C) Arrivederci', 'D) A presto'] }
        ],
      },
    },
    {
      id: 'hardcoded_lettura_1',
      skill_type: 'lettura',
      title: "Orari dei Negozi",
      content: {
        prompt_it: 'Leggi il testo e rispondi alle domande.',
        text_it: "ORARI NEGOZI CENTRO COMMERCIALE\n\nTutti i negozi sono aperti dal lunedì al sabato dalle 9:00 alle 20:00.\nLa domenica apertura dalle 10:00 alle 19:00.\nIl supermercato è aperto tutti i giorni dalle 8:00 alle 21:00.\nLa farmacia chiude alle 19:30 dal lunedì al venerdì.\nNel weekend la farmacia è aperta solo la domenica mattina dalle 9:00 alle 13:00.",
        timer_seconds: 600,
        questions: [
          { id: 'q1', text: "A che ora aprono i negozi la domenica?", options: ['A) Alle 8:00', 'B) Alle 9:00', 'C) Alle 10:00', 'D) Alle 11:00'] },
          { id: 'q2', text: "Quando chiude il supermercato?", options: ['A) Alle 19:00', 'B) Alle 20:00', 'C) Alle 21:00', 'D) Alle 22:00'] },
          { id: 'q3', text: "La farmacia è aperta il sabato?", options: ['A) Sì, tutto il giorno', 'B) Sì, solo la mattina', 'C) No', 'D) Solo il pomeriggio'] },
          { id: 'q4', text: "Fino a che ora resta aperta la farmacia in settimana?", options: ['A) Alle 19:00', 'B) Alle 19:30', 'C) Alle 20:00', 'D) Alle 21:00'] }
        ],
      },
    },
    {
      id: 'hardcoded_scrittura_1',
      skill_type: 'scrittura',
      title: 'Email Formale',
      content: {
        prompt_it: 'Scrivi una e-mail formale (90–120 parole) per prenotare una visita medica. Includi: motivo della visita, giorni disponibili, i tuoi dati.',
        timer_seconds: 1800,
        questions: [],
      },
    },
    {
      id: 'hardcoded_orale_1',
      skill_type: 'produzione_orale',
      title: 'Presentazione Personale',
      content: {
        prompt_it: 'Presentati in italiano parlando per 2-3 minuti. Parla di: nome, età, città, lavoro/studi, hobby, famiglia.',
        timer_seconds: 300,
        questions: [],
      },
    },
  ];

  // Load exercises immediately without auth requirement
  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setIsLoading(true);

      // Load exercises from cache or generate new ones
      const skills = ['ascolto', 'lettura', 'scrittura', 'produzione_orale'] as const;
      const allExercises = [];

      for (const skill of skills) {
        // Try to get 3 exercises from cache first
        const cachedExercises = ExerciseCache.getExercisesByType(skill, 3);
        
        if (cachedExercises.length >= 3) {
          // Use cached exercises
          allExercises.push(...cachedExercises.map(ex => ({
            id: ex.id,
            skill_type: ex.type,
            title: ex.title,
            content: {
              prompt_it: ex.prompt_it,
              audio_url: ex.audio_url,
              text_it: ex.text_it,
              timer_seconds: ex.timer_seconds,
              questions: ex.questions || [],
              min_words: ex.min_words,
              max_words: ex.max_words,
            },
          })));
        } else {
          // Try dynamic generation first, fallback to static
          let exercisesData = [];
          
          try {
            const dynamicResponse = await supabase.functions.invoke('generate-dynamic-exercises', {
              body: { skill_type: skill, count: 3 - cachedExercises.length },
            });
            
            if (!dynamicResponse.error && dynamicResponse.data?.exercises) {
              exercisesData = dynamicResponse.data.exercises;
            }
          } catch (dynamicError) {
            console.log('Dynamic generation failed, using static:', dynamicError);
          }
          
          // Fallback to static exercises if dynamic generation fails
          if (exercisesData.length === 0) {
            const response = await supabase.functions.invoke('generate-exercises', {
              body: { skill_type: skill, count: 3 - cachedExercises.length },
            });

            if (!response.error) {
              exercisesData = response.data?.exercises || [response.data?.exercise].filter(Boolean);
            }
          }
          
          // Add cached exercises first
          allExercises.push(...cachedExercises.map(ex => ({
            id: ex.id,
            skill_type: ex.type,
            title: ex.title,
            content: {
              prompt_it: ex.prompt_it,
              audio_url: ex.audio_url,
              text_it: ex.text_it,
              timer_seconds: ex.timer_seconds,
              questions: ex.questions || [],
              min_words: ex.min_words,
              max_words: ex.max_words,
            },
          })));
          
          // Add new exercises and cache them
          for (const exercise of exercisesData) {
            if (exercise) {
              // Cache the exercise
              ExerciseCache.addExercise({
                id: exercise.id,
                type: exercise.type,
                title: exercise.title,
                prompt_it: exercise.prompt_it,
                text_it: exercise.text_it,
                audio_url: exercise.audio_url,
                audio_text: exercise.audio_text,
                timer_seconds: exercise.timer_seconds,
                questions: exercise.questions || [],
                min_words: exercise.min_words,
                max_words: exercise.max_words,
              });

              allExercises.push({
                id: exercise.id,
                skill_type: exercise.type,
                title: exercise.title,
                content: {
                  prompt_it: exercise.prompt_it,
                  audio_url: exercise.audio_url,
                  text_it: exercise.text_it,
                  timer_seconds: exercise.timer_seconds,
                  questions: exercise.questions || [],
                  min_words: exercise.min_words,
                  max_words: exercise.max_words,
                },
              });
            }
          }
        }
      }

      if (allExercises.length === 0) {
        throw new Error('Nessun esercizio disponibile');
      }

      setExercises(allExercises);

      const cacheStats = ExerciseCache.getCacheStats();
      toast({
        title: 'Demo caricata',
        description: `12 esercizi pronti (${cacheStats.exerciseCount} in cache).`
      });
    } catch (error) {
      console.error('Error loading exercises:', error);
      
      // Use hardcoded fallback
      setExercises(fallbackExercises);
      
      toast({
        title: 'Demo caricata',
        description: 'Usando esercizi demo predefiniti.'
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

  const handleSimulatorComplete = (examResults: any) => {
    setResults(examResults.exercises || []);
    setShowSimulator(false);
  };

  const startExamSimulator = () => {
    setShowSimulator(true);
    setResults([]);
  };

  const saveResults = async (finalResults: SkillResult[]) => {
    try {
      const totalScore = Math.round(
        finalResults.reduce((sum, result) => sum + result.score, 0) / finalResults.length
      );

      // Only save if user is logged in
      if (user) {
        const { error } = await supabase
          .from('demo_attempts')
          .insert({
            user_id: user.id,
            session_id: sessionId,
            total_score: totalScore,
            results: finalResults as any
          });

        if (error) throw error;
      }

      toast({
        title: "Simulazione completata!",
        description: user ? "I tuoi risultati sono stati salvati." : "Registrati per salvare i risultati!"
      });
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const restartDemo = () => {
    setShowSimulator(false);
    setCurrentStep(0);
    setResults([]);
    setIsLoading(true);
    loadExercises();
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

  // Demo is now open to everyone - no auth check needed

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

  // Show results if simulator completed
  if (!showSimulator && exercises.length > 0 && results.length > 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <ExamResults results={{ exercises: results }} onRestart={restartDemo} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show exam simulator
  if (showSimulator && exercises.length > 0) {
    const simulatorExercises = exercises.map(ex => ({
      id: ex.id,
      type: ex.skill_type,
      title: ex.title,
      prompt_it: ex.content?.prompt_it || '',
      text_it: ex.content?.text_it || '',
      audio_url: ex.content?.audio_url || '',
      timer_seconds: ex.content?.timer_seconds || 600,
      questions: ex.content?.questions || []
    }));

    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-12">
            <ExamSimulator exercises={simulatorExercises} onComplete={handleSimulatorComplete} />
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
              Demo CILS B1
            </h1>
            <p className="text-xl text-muted-foreground">
              Prova gratuita delle 4 competenze dell'esame CILS B1 Cittadinanza
            </p>
            
            <div className="flex justify-center gap-4">
              <Button 
                size="lg" 
                onClick={startExamSimulator}
                className="bg-primary hover:bg-primary/90"
              >
                🎯 Inizia Simulazione Esame Completo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Modalità esame: cronometro, navigazione tra domande, invio finale
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