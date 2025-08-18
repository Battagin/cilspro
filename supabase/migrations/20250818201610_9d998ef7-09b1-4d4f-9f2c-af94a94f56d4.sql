-- Create tables for demo content and results

-- Demo exercises table
CREATE TABLE public.demo_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_type TEXT NOT NULL CHECK (skill_type IN ('ascolto', 'lettura', 'scrittura', 'produzione_orale')),
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Store exercise content (audio_url, text, questions, etc)
  answer_key JSONB NOT NULL, -- Store correct answers
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Demo attempts table
CREATE TABLE public.demo_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- For non-logged users
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_score INTEGER NOT NULL DEFAULT 0,
  results JSONB NOT NULL, -- Store detailed results for each skill
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for demo_exercises (public read access)
CREATE POLICY "Demo exercises are viewable by everyone" 
ON public.demo_exercises 
FOR SELECT 
USING (true);

-- RLS policies for demo_attempts
CREATE POLICY "Users can view their own demo attempts" 
ON public.demo_attempts 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own demo attempts" 
ON public.demo_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Insert sample demo exercises
INSERT INTO public.demo_exercises (skill_type, title, content, answer_key) VALUES
(
  'ascolto',
  'Dialogo al supermercato',
  '{
    "audio_url": "/demo-audio/supermercato.mp3",
    "instructions": "Ascolta il dialogo e rispondi alle domande. Puoi ascoltare massimo 2 volte.",
    "questions": [
      {
        "id": 1,
        "question": "Dove si svolge la conversazione?",
        "options": ["Al supermercato", "In farmacia", "In banca", "Al ristorante"]
      },
      {
        "id": 2,
        "question": "Cosa cerca la cliente?",
        "options": ["Pasta", "Formaggio", "Pane", "Latte"]
      },
      {
        "id": 3,
        "question": "Quanto costa il prodotto?",
        "options": ["3,50 euro", "4,20 euro", "2,80 euro", "5,00 euro"]
      }
    ]
  }',
  '{"1": 0, "2": 3, "3": 1}'
),
(
  'lettura',
  'Avviso condominiale',
  '{
    "text": "AVVISO AI CONDOMINI\n\nSi comunica che mercoledì 25 marzo dalle ore 9:00 alle ore 17:00 sarà sospesa l''erogazione dell''acqua per lavori di manutenzione all''impianto idrico del palazzo.\n\nSi prega di fare scorta d''acqua prima dell''orario indicato.\n\nGrazie per la collaborazione.\n\nL''Amministratore",
    "instructions": "Leggi il testo e rispondi alle domande.",
    "questions": [
      {
        "id": 1,
        "question": "Quando sarà sospesa l''acqua?",
        "options": ["Martedì 24 marzo", "Mercoledì 25 marzo", "Giovedì 26 marzo", "Venerdì 27 marzo"]
      },
      {
        "id": 2,
        "question": "Per quanto tempo sarà sospesa l''erogazione?",
        "options": ["4 ore", "6 ore", "8 ore", "10 ore"]
      },
      {
        "id": 3,
        "question": "Qual è il motivo della sospensione?",
        "options": ["Pulizia delle cisterne", "Lavori di manutenzione", "Controlli di sicurezza", "Sostituzione dei contatori"]
      }
    ]
  }',
  '{"1": 1, "2": 2, "3": 1}'
),
(
  'scrittura',
  'Email di presentazione',
  '{
    "instructions": "Scrivi una email di presentazione per candidarti come volontario in una biblioteca. Scrivi minimo 90 parole. Includi: presentazione personale, motivazioni, disponibilità.",
    "min_words": 90,
    "max_words": 120
  }',
  '{}'
),
(
  'produzione_orale',
  'Parlare della propria famiglia',
  '{
    "instructions": "Registra un messaggio di 2-3 minuti dove parli della tua famiglia: membri, lavori, hobby e tradizioni familiari.",
    "duration_seconds": 180
  }',
  '{}'
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_demo_exercises_updated_at
BEFORE UPDATE ON public.demo_exercises
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();