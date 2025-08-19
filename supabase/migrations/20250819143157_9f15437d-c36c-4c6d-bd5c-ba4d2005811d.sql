-- Cache IA per risposte determinate (chiave = hash payload)
CREATE TABLE IF NOT EXISTS public.ai_cache (
  cache_key text PRIMARY KEY,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  ttl_seconds integer NOT NULL DEFAULT 2592000
);

-- Limite giornaliero per versione gratuita (1 esercizio per skill al giorno)
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id bigserial PRIMARY KEY,
  user_id uuid,
  skill text NOT NULL check (skill in ('ascolto','lettura','scrittura','orale')),
  used_on date NOT NULL,
  count integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, skill, used_on)
);

-- Enable RLS on new tables
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_cache (allow service role only)
CREATE POLICY ai_cache_service_only ON public.ai_cache
FOR ALL TO public
USING (false)
WITH CHECK (false);

-- RLS policies for daily_usage (users can only see their own usage)
CREATE POLICY daily_usage_select_own ON public.daily_usage
FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY daily_usage_insert_own ON public.daily_usage  
FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY daily_usage_update_own ON public.daily_usage
FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);