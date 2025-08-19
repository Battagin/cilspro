import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Headphones, BookOpen, PenTool, Mic, RefreshCw } from 'lucide-react';

interface ExamResultsProps {
  results: any;
  onRestart: () => void;
}

export const ExamResults: React.FC<ExamResultsProps> = ({ results, onRestart }) => {
  const getSkillIcon = (type: string) => {
    switch (type) {
      case 'ascolto': return Headphones;
      case 'lettura': return BookOpen;
      case 'scrittura': return PenTool;
      case 'produzione_orale': return Mic;
      default: return BookOpen;
    }
  };

  const getSkillTitle = (type: string) => {
    switch (type) {
      case 'ascolto': return 'Comprensione Orale';
      case 'lettura': return 'Comprensione Scritta';
      case 'scrittura': return 'Produzione Scritta';
      case 'produzione_orale': return 'Produzione Orale';
      default: return type;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Eccellente';
    if (score >= 60) return 'Sufficiente';
    return 'Insufficiente';
  };

  const totalScore = results.exercises.reduce((sum: number, ex: any) => {
    return sum + (ex.evaluation?.score || 0);
  }, 0) / results.exercises.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Simulazione Demo Completata!</CardTitle>
          <div className="space-y-2">
            <div className="text-4xl font-bold">{Math.round(totalScore)}/100</div>
            <Badge 
              variant="secondary"
              className={`${getScoreColor(totalScore)} text-white`}
            >
              {getScoreLabel(totalScore)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {results.exercises.map((exercise: any, index: number) => {
          const Icon = getSkillIcon(exercise.exercise.type);
          const score = exercise.evaluation?.score || 0;
          
          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-lg">{getSkillTitle(exercise.exercise.type)}</CardTitle>
                      <p className="text-sm text-muted-foreground">{exercise.exercise.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{score}/100</div>
                    <Badge 
                      variant="secondary"
                      className={`${getScoreColor(score)} text-white text-xs`}
                    >
                      {getScoreLabel(score)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              {exercise.evaluation?.feedback && (
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Feedback:</h4>
                    <p className="text-sm">{exercise.evaluation.feedback}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-4">Prossimi Passi</h3>
          <p className="text-muted-foreground mb-6">
            Questa è solo una demo! Registrati per accedere a simulazioni complete, 
            feedback dettagliati e tracciamento dei progressi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onRestart} variant="outline" size="lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              Rifa la Demo
            </Button>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Inizia Preparazione Completa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};