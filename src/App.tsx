import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import Esercizi from "./pages/Esercizi";
import LetturaPage from "./pages/esercizi/Lettura";
import OralePage from "./pages/esercizi/Orale";
import DynamicExercisePage from "./pages/esercizi/[type]/[subtype]";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FreeTraining from "./pages/FreeTraining";
import Plans from "./pages/Plans";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/esercizi" element={<Esercizi />} />
          <Route path="/esercizi/lettura" element={<LetturaPage />} />
          <Route path="/esercizi/orale" element={<OralePage />} />
          <Route path="/esercizi/:type/:subtype" element={<DynamicExercisePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registrazione" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/allenamento-gratuito" element={<FreeTraining />} />
          <Route path="/piani" element={<Plans />} />
          <Route path="/chi-siamo" element={<About />} />
          <Route path="/contatti" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/termini" element={<Terms />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
