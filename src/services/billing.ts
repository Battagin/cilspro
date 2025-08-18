import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const startCheckoutMensile = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Errore",
        description: "Devi effettuare l'accesso per acquistare un piano",
        variant: "destructive",
      });
      return;
    }

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
};

export const startCheckoutAnnuale = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Errore",
        description: "Devi effettuare l'accesso per acquistare un piano",
        variant: "destructive",
      });
      return;
    }

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
};

export const startTrial = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Errore",
        description: "Devi effettuare l'accesso per iniziare la prova gratuita",
        variant: "destructive",
      });
      return;
    }

    // Redirect to free training/dashboard
    window.location.href = '/allenamento-gratuito';
    
    toast({
      title: "Accesso alla prova gratuita",
      description: "Inizia subito con gli esercizi gratuiti disponibili!",
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    toast({
      title: "Errore",
      description: "Si è verificato un errore. Riprova.",
      variant: "destructive",
    });
  }
};