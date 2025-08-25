import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw, ArrowLeft, Trophy, AlertCircle } from "lucide-react";

interface FeedbackCardProps {
  feedback: any;
  exerciseType: string;
  onRetry: () => void;
  onBack: () => void;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  exerciseType,
  onRetry,
  onBack
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const renderMultipleChoiceFeedback = () => {
    if (!feedback.corrections) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Risultati delle risposte</h3>
          <Badge variant={getScoreBadgeVariant(feedback.score)}>
            {feedback.score}/100
          </Badge>
        </div>

        <div className="space-y-3">
          {Object.entries(feedback.corrections).map(([questionId, result]: [string, any]) => (
            <div key={questionId} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              {result.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              
              <div className="flex-1">
                <p className="text-sm">
                  <strong>Tua risposta:</strong> {result.user}
                </p>
                {!result.isCorrect && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Risposta corretta:</strong> {result.correct}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Progress value={feedback.score} className="w-full" />
        
        <div className="text-center">
          <p className="text-muted-foreground">{feedback.feedback}</p>
        </div>
      </div>
    );
  };

  const renderDetailedFeedback = () => {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <span className={`text-2xl font-bold ${getScoreColor(feedback.score)}`}>
              {feedback.score}/100
            </span>
          </div>
          <p className="text-muted-foreground">Punteggio stimato</p>
        </div>

        <Progress value={feedback.score} className="w-full" />

        {feedback.correctedText && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Testo corretto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="leading-relaxed">{feedback.correctedText}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {feedback.criteria && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Valutazione per criterio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(feedback.criteria).map(([criterion, score]: [string, any]) => (
                  <div key={criterion} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{criterion}</span>
                      <span className={`font-bold ${getScoreColor(score)}`}>
                        {score}/100
                      </span>
                    </div>
                    <Progress value={score} className="w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Feedback dettagliato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {feedback.feedback}
              </p>
            </div>
          </CardContent>
        </Card>

        {feedback.improvements && feedback.improvements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aree di miglioramento</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Risultati dell'esercizio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {['ascolto', 'lettura'].includes(exerciseType) 
            ? renderMultipleChoiceFeedback() 
            : renderDetailedFeedback()
          }
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRetry} variant="default" size="lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          Prova un altro esercizio
        </Button>
        
        <Button onClick={onBack} variant="outline" size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna al menu
        </Button>
      </div>
    </div>
  );
};

export default FeedbackCard;