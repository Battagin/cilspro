import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, User, Crown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SkillResult {
  skill: string;
  score: number;
  feedback?: string;
  criteria?: Record<string, number>;
}

interface DemoResultsProps {
  results: SkillResult[];
  onRestart: () => void;
}

const DemoResults: React.FC<DemoResultsProps> = ({ results, onRestart }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const averageScore = Math.round(
    results.reduce((sum, result) => sum + result.score, 0) / results.length
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Eccellente';
    if (score >= 60) return 'Buono';
    if (score >= 40) return 'Sufficiente';
    return 'Da migliorare';
  };

  const generateAdvice = () => {
    const lowestScore = Math.min(...results.map(r => r.score));
    const lowestSkill = results.find(r => r.score === lowestScore);
    
    if (averageScore >= 75) {
      return "Ottimo lavoro! Sei ben preparato per l'esame CILS B1 Cittadinanza.";
    } else if (averageScore >= 50) {
      return `Buona preparazione generale. Concentrati sul miglioramento della ${lowestSkill?.skill.toLowerCase()}.`;
    } else {
      return "Continua a studiare e praticare. Considera un corso di preparazione specifico.";
    }
  };

  return (
    <div className="w-full space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Simulazione Demo Completata!</CardTitle>
          <p className="text-muted-foreground">
            Ecco i risultati della tua simulazione CILS B1 Cittadinanza
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold">
              <span className={getScoreColor(averageScore)}>{averageScore}%</span>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {getScoreLabel(averageScore)}
            </Badge>
            <Progress value={averageScore} className="w-full max-w-sm mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {results.map((result, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize">{result.skill}</h4>
                  <span className={`font-bold ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </span>
                </div>
                <Progress value={result.score} className="h-2" />
                {result.feedback && (
                  <p className="text-sm text-muted-foreground">
                    {result.feedback}
                  </p>
                )}
                {result.criteria && (
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(result.criteria).map(([criterion, score]) => (
                      <div key={criterion} className="flex justify-between">
                        <span className="capitalize">{criterion}:</span>
                        <span className={getScoreColor(score)}>{score}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Consiglio personalizzato:</h4>
            <p className="text-sm text-blue-800">{generateAdvice()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {!user ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <User className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <h4 className="font-medium text-orange-900">Salva i tuoi progressi</h4>
                  <p className="text-sm text-orange-800">
                    Registrati gratuitamente per salvare i risultati e accedere a simulazioni complete
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/registrazione">
                    <Button className="w-full sm:w-auto">
                      <User className="w-4 h-4 mr-2" />
                      Registrati gratis
                    </Button>
                  </Link>
                  <Button onClick={onRestart} variant="outline">
                    Rifai la demo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-medium text-green-900">Risultati salvati!</h4>
                  <p className="text-sm text-green-800">
                    I tuoi risultati sono stati salvati nel tuo account
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/dashboard">
                    <Button>
                      Vai al Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Button onClick={onRestart} variant="outline">
                    Rifai la demo
                  </Button>
                </div>
              </div>
            )}
            
            <div className="border-t pt-4">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                  <Crown className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Sblocca tutte le funzionalità</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Accedi a simulazioni complete, correzioni dettagliate e tracciamento progressi
                  </p>
                  <Link to="/piani">
                    <Button>
                      Vedi i piani
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoResults;