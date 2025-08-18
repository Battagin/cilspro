import Header from "@/components/Header";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Plans = () => {

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Plans;