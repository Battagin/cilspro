// Emergency mode: generate demo exercises in memory without database
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    const items: any[] = [];
    
    // Ascolto (without audio if DEMO_ASCOLTO_AUDIO_URL not available)
    items.push({
      id: "temp_ascolto",
      type: "ascolto",
      title: "Ascolto demo — Comune",
      prompt_it: "Ascolta l'audio e rispondi alle domande.",
      audio_url: process.env.DEMO_ASCOLTO_AUDIO_URL || null,
      text_it: null,
      timer_seconds: 480,
      level: "B1",
      questions: [
        { 
          id: "q1", 
          text: "La riapertura è prevista alle:", 
          options: ["A) 9:00", "B) 11:00", "C) 14:00", "D) 16:00"] 
        },
        { 
          id: "q2", 
          text: "Per urgenze bisogna:", 
          options: ["A) Telefonare", "B) Scrivere una e-mail", "C) Andare di persona", "D) Compilare un modulo"] 
        },
        { 
          id: "q3", 
          text: "L'ufficio chiude per:", 
          options: ["A) Riunione", "B) Lavori", "C) Aggiornamento sistemi", "D) Festa cittadina"] 
        }
      ]
    });
    
    // Lettura
    items.push({
      id: "temp_lettura", 
      type: "lettura",
      title: "Avviso dell'Ufficio Anagrafe",
      prompt_it: "Leggi il testo e rispondi alle domande.",
      audio_url: null,
      text_it: "AVVISO: L'ufficio anagrafe sarà chiuso lunedì mattina per aggiornamento dei sistemi informatici. La riapertura è prevista alle ore 14:00. Per casi urgenti che non possono attendere la riapertura, è possibile scrivere una e-mail all'indirizzo anagrafe@comune.example.it specificando la natura dell'urgenza. Il personale risponderà entro 24 ore lavorative. Si ricorda che per il rilascio di documenti è sempre necessario presentarsi di persona con un documento di identità valido.",
      timer_seconds: 600,
      level: "B1",
      questions: [
        { 
          id: "q1", 
          text: "Quando riapre l'ufficio?", 
          options: ["A) 9:00", "B) 11:00", "C) 14:00", "D) 16:00"] 
        },
        { 
          id: "q2", 
          text: "Per urgenze si deve:", 
          options: ["A) Telefonare", "B) Scrivere una e-mail", "C) Presentarsi di persona", "D) Compilare un modulo"] 
        },
        { 
          id: "q3", 
          text: "Perché è chiuso l'ufficio?", 
          options: ["A) Riunione del personale", "B) Lavori di ristrutturazione", "C) Aggiornamento sistemi", "D) Festa cittadina"] 
        }
      ]
    });
    
    // Scrittura
    items.push({
      id: "temp_scrittura", 
      type: "scrittura",
      title: "Email di richiesta informazioni",
      prompt_it: "Scrivi una e-mail (90–120 parole) all'ufficio anagrafe del Comune di Vicenza per chiedere quali documenti servono per fare la richiesta di residenza. Includi i tuoi dati personali e specifica che sei nuovo in città.",
      audio_url: null,
      text_it: null,
      timer_seconds: 1200,
      level: "B1",
      min_words: 90,
      max_words: 120,
      questions: []
    });
    
    // Orale
    items.push({
      id: "temp_orale", 
      type: "produzione_orale",
      title: "Presentazione personale",
      prompt_it: "Registra un audio di circa 2 minuti in cui ti presenti, descrivi brevemente il tuo lavoro o i tuoi studi attuali, e racconta una difficoltà che hai superato vivendo in Italia.",
      audio_url: null,
      text_it: null,
      timer_seconds: 600,
      level: "B1",
      questions: []
    });

    return res.status(200).json({ 
      items,
      message: "Esercizi demo generati in modalità emergenza (senza database)",
      emergency_mode: true
    });
  } catch (e: any) {
    console.error("Force generate error:", e);
    return res.status(500).json({ error: e.message || "Force generate fallito." });
  }
}