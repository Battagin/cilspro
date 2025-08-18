import Header from "@/components/Header";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";

const Plans = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              {t("plans")} CILSpro
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Scegli il piano perfetto per la tua preparazione CILS B1 Cittadinanza. 
              Prezzi trasparenti in Euro, con garanzia di soddisfazione.
            </p>
          </div>
        </div>
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Plans;