import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Auth guard functions
let authContext: any = null;
let navigate: any = null;

export const setAuthDependencies = (auth: any, nav: any) => {
  authContext = auth;
  navigate = nav;
};

const ensureAuthenticated = (action: () => void) => {
  if (authContext?.user) {
    action();
  } else {
    toast({
      title: "Accesso richiesto",
      description: "Devi effettuare l'accesso per abbonarti",
      variant: "destructive",
    });
    navigate('/registrazione');
  }
};

export const startCheckoutMensile = async () => {
  ensureAuthenticated(() => {
    try {
      // Direct Payment Link redirect - Mensile
      const paymentLink = "https://buy.stripe.com/test_bJe5kD93k1cqe1E0q82oE00";
      
      // Open Payment Link in new tab
      window.open(paymentLink, '_blank');
      
    } catch (error) {
      console.error('Error starting monthly checkout:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'avvio del checkout",
        variant: "destructive",
      });
    }
  });
};

export const startCheckoutAnnuale = async () => {
  ensureAuthenticated(() => {
    try {
      // Direct Payment Link redirect - Annuale
      const paymentLink = "https://buy.stripe.com/test_6oU8wP6Vcg7k8Hkc8Q2oE01";
      
      // Open Payment Link in new tab
      window.open(paymentLink, '_blank');
      
    } catch (error) {
      console.error('Error starting yearly checkout:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'avvio del checkout",
        variant: "destructive",
      });
    }
  });
};

export const startTrial = async () => {
  try {
    // Navigate to demo page directly - no authentication required
    if (navigate) {
      navigate('/demo');
    } else {
      window.location.href = '/demo';
    }
  } catch (error) {
    console.error('Error starting trial:', error);
    toast({
      title: "Errore",
      description: "Si è verificato un errore. Riprova.",
      variant: "destructive",
    });
  }
};