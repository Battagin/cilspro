import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";

const Terms = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6 mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                {t("termsOfService")}
              </h1>
              <p className="text-lg text-muted-foreground">
                Ultimo aggiornamento: Gennaio 2025
              </p>
            </div>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Accettazione dei termini</h2>
                <p className="text-muted-foreground">
                  Utilizzando CILSpro, accetti di essere vincolato da questi termini di servizio. 
                  Se non accetti questi termini, non utilizzare il nostro servizio.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Descrizione del servizio</h2>
                <p className="text-muted-foreground">
                  CILSpro è una piattaforma di preparazione online per l'esame CILS B1 Cittadinanza, 
                  che offre simulazioni, esercizi interattivi e feedback automatizzato con intelligenza artificiale.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Uso accettabile</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Utilizzare il servizio solo per scopi educativi personali</li>
                  <li>Non condividere le credenziali di accesso con terzi</li>
                  <li>Non tentare di violare la sicurezza della piattaforma</li>
                  <li>Rispettare i diritti di proprietà intellettuale</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Abbonamenti e pagamenti</h2>
                <p className="text-muted-foreground">
                  Gli abbonamenti sono fatturati in anticipo su base mensile o annuale. 
                  Le cancellazioni non comportano rimborsi per il periodo già pagato, 
                  ma manterrai l'accesso fino alla scadenza dell'abbonamento.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Proprietà intellettuale</h2>
                <p className="text-muted-foreground">
                  Tutti i contenuti, esercizi e materiali presenti su CILSpro sono protetti da copyright 
                  e non possono essere riprodotti o distribuiti senza autorizzazione scritta.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Limitazione di responsabilità</h2>
                <p className="text-muted-foreground">
                  CILSpro fornisce contenuti educativi ma non garantisce il successo nell'esame CILS B1. 
                  Il risultato dipende dall'impegno individuale e dalla preparazione personale.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Contatti</h2>
                <p className="text-muted-foreground">
                  Per domande sui termini di servizio, contattaci a: contatto@cilspro.com
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;