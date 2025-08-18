import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SubscriptionStatus {
  active: boolean;
  inactive: boolean;
  trialing: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const refreshSubscriptionStatus = async (): Promise<SubscriptionStatus | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Errore",
        description: "Devi effettuare l'accesso per aggiornare lo stato dell'abbonamento",
        variant: "destructive",
      });
      return null;
    }

    // Call the check-subscription edge function
    const { data, error } = await supabase.functions.invoke('check-subscription', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;

    const subscriptionStatus: SubscriptionStatus = {
      active: data.subscribed || false,
      inactive: !data.subscribed,
      trialing: false, // TODO: implement trial logic if needed
      subscription_tier: data.subscription_tier,
      subscription_end: data.subscription_end,
    };

    toast({
      title: "Status aggiornato",
      description: data.subscribed 
        ? `Abbonamento ${data.subscription_tier} attivo` 
        : "Nessun abbonamento attivo",
    });

    return subscriptionStatus;
  } catch (error) {
    console.error('Error refreshing subscription status:', error);
    toast({
      title: "Errore",
      description: "Si è verificato un errore durante l'aggiornamento dello status",
      variant: "destructive",
    });
    return null;
  }
};