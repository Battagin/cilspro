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

    // Try to use Stripe Checkout via Edge Function first
    const priceId = import.meta.env.VITE_PRICE_ID_MENSILE;
    
    if (priceId) {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      return;
    }

    // Fallback to Payment Link
    const paymentLink = import.meta.env.VITE_PAYMENT_LINK_MENSILE;
    
    if (paymentLink) {
      window.location.href = paymentLink;
      return;
    }

    // No configuration available
    toast({
      title: "Configurazione mancante",
      description: "Configura i link di pagamento nel file .env",
      variant: "destructive",
    });
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

    // Try to use Stripe Checkout via Edge Function first
    const priceId = import.meta.env.VITE_PRICE_ID_ANNUALE;
    
    if (priceId) {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      return;
    }

    // Fallback to Payment Link
    const paymentLink = import.meta.env.VITE_PAYMENT_LINK_ANNUALE;
    
    if (paymentLink) {
      window.location.href = paymentLink;
      return;
    }

    // No configuration available
    toast({
      title: "Configurazione mancante",
      description: "Configura i link di pagamento nel file .env",
      variant: "destructive",
    });
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

    // For now, just redirect to dashboard
    // In the future, this could create a trial subscription
    window.location.href = '/dashboard';
    
    toast({
      title: "Prova gratuita iniziata",
      description: "Benvenuto nella tua prova gratuita di CILSpro!",
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    toast({
      title: "Errore",
      description: "Si è verificato un errore durante l'avvio della prova gratuita",
      variant: "destructive",
    });
  }
};