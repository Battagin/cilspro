-- ASCOLTO (demo)
INSERT INTO public.demo_exercises (id, title, skill_type, content, created_at, updated_at)
VALUES
(1001, 'Appuntamento in Comune', 'ascolto', 
'{
  "prompt_it": "Ascolta la conversazione e rispondi alle domande a scelta multipla.",
  "audio_url": "https://cdn.example.com/audio/comune_demo.mp3",
  "timer_seconds": 480,
  "level": "B1",
  "questions": [
    {
      "id": "q1",
      "text": "Quando è aperto l''ufficio anagrafe?",
      "options": ["A) Solo di mattina", "B) Dal lunedì al venerdì 9-17", "C) Solo di pomeriggio"]
    },
    {
      "id": "q2", 
      "text": "Che documento serve per la residenza?",
      "options": ["A) Codice fiscale e passaporto", "B) Solo passaporto", "C) Solo codice fiscale"]
    },
    {
      "id": "q3",
      "text": "Dove si trova l''ufficio?",
      "options": ["A) Piano terra", "B) Primo piano", "C) Secondo piano"]
    }
  ]
}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- LETTURA (demo)
INSERT INTO public.demo_exercises (id, title, skill_type, content, created_at, updated_at)
VALUES
(1002, 'Avviso dell''ufficio anagrafe', 'lettura', 
'{
  "prompt_it": "Leggi il testo e rispondi alle domande a scelta multipla.",
  "text_it": "AVVISO: L''ufficio anagrafe sarà chiuso lunedì mattina per aggiornamento dei sistemi. Riapertura alle 14:00. Per urgenze è possibile scrivere a anagrafe@comune.example.it o chiamare il numero verde 800-123456 dalle 9:00 alle 12:00.",
  "timer_seconds": 600,
  "level": "B1",
  "questions": [
    {
      "id": "q1",
      "text": "Quando riapre l''ufficio?",
      "options": ["A) Lunedì mattina", "B) Martedì mattina", "C) Lunedì pomeriggio"]
    },
    {
      "id": "q2",
      "text": "Come contattare per urgenze?",
      "options": ["A) Solo telefono", "B) Email o telefono", "C) Solo email"]
    },
    {
      "id": "q3",
      "text": "Il numero verde è attivo:",
      "options": ["A) Tutto il giorno", "B) Solo di mattina", "C) Solo di pomeriggio"]
    }
  ]
}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- SCRITTURA (demo)
INSERT INTO public.demo_exercises (id, title, skill_type, content, created_at, updated_at)
VALUES
(1003, 'Email di richiesta informazioni', 'scrittura', 
'{
  "prompt_it": "Scrivi una e-mail (90–120 parole) per chiedere quali documenti servono per la residenza a Vicenza.",
  "timer_seconds": 1200,
  "level": "B1",
  "min_words": 90,
  "max_words": 120
}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- ORALE (demo)
INSERT INTO public.demo_exercises (id, title, skill_type, content, created_at, updated_at)
VALUES
(1004, 'Presentazione personale', 'orale', 
'{
  "prompt_it": "Registra un audio di 2 minuti: presentati e descrivi la tua routine in Italia.",
  "timer_seconds": 600,
  "level": "B1"
}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Gabaritos PRIVADOS (apenas Ascolto e Lettura precisam)
-- ASCOLTO 3 MCQs
INSERT INTO private.demo_exercise_keys (exercise_id, answer_key)
VALUES
(1001, '{"items":[
  {"id":"q1","correct":"B"},
  {"id":"q2","correct":"A"},
  {"id":"q3","correct":"C"}
]}')
ON CONFLICT (exercise_id) DO UPDATE SET answer_key = EXCLUDED.answer_key;

-- LETTURA 3 MCQs
INSERT INTO private.demo_exercise_keys (exercise_id, answer_key)
VALUES
(1002, '{"items":[
  {"id":"q1","correct":"C"},
  {"id":"q2","correct":"B"},
  {"id":"q3","correct":"A"}
]}')
ON CONFLICT (exercise_id) DO UPDATE SET answer_key = EXCLUDED.answer_key;