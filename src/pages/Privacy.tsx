import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";

const Privacy = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6 mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                {t("privacyPolicy")}
              </h1>
              <p className="text-lg text-muted-foreground">
                Ultimo aggiornamento: Gennaio 2025
              </p>
            </div>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Informazioni che raccogliamo</h2>
                <p className="text-muted-foreground">
                  CILSpro raccoglie informazioni quando ti registri al nostro servizio, utilizzi le nostre funzionalità 
                  o comunichi con noi. Questo include nome, indirizzo email, progressi di apprendimento e preferenze di utilizzo.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Come utilizziamo le tue informazioni</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Fornire e migliorare i nostri servizi di preparazione CILS B1</li>
                  <li>Personalizzare la tua esperienza di apprendimento</li>
                  <li>Comunicare aggiornamenti e contenuti educativi</li>
                  <li>Analizzare l'utilizzo per migliorare la piattaforma</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Condivisione delle informazioni</h2>
                <p className="text-muted-foreground">
                  Non vendiamo, scambiamo o trasferiamo le tue informazioni personali a terze parti senza il tuo consenso, 
                  eccetto nei casi previsti dalla legge o per fornire i servizi richiesti.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Sicurezza dei dati</h2>
                <p className="text-muted-foreground">
                  Implementiamo misure di sicurezza appropriate per proteggere le tue informazioni personali 
                  contro accesso non autorizzato, alterazione, divulgazione o distruzione.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. I tuoi diritti</h2>
                <p className="text-muted-foreground">
                  Hai il diritto di accedere, aggiornare o eliminare le tue informazioni personali. 
                  Puoi contattarci in qualsiasi momento per esercitare questi diritti.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Contatti</h2>
                <p className="text-muted-foreground">
                  Per domande su questa privacy policy, contattaci a: contatto@cilspro.com
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

export default Privacy;