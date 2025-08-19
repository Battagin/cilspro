-- HARDENING DE SEGURANÇA CILSpro (Supabase)
-- A) Proteger o gabarito (answer_key) da tabela demo_exercises

-- 1) Garantir RLS ativo (já está, mas confirmando)
ALTER TABLE public.demo_exercises ENABLE ROW LEVEL SECURITY;

-- 2) Revogar qualquer SELECT público no gabarito
REVOKE ALL ON public.demo_exercises FROM anon, authenticated;

-- Concede SELECT APENAS nas colunas públicas (sem answer_key)
GRANT SELECT (id, title, content, skill_type, created_at, updated_at)
ON public.demo_exercises TO anon, authenticated;

-- 3) Remover a policy permissiva que expõe tudo
DROP POLICY IF EXISTS demo_exercises_service_role_only ON public.demo_exercises;
DROP POLICY IF EXISTS demo_exercises_no_user_access ON public.demo_exercises;

-- 4) Criar uma policy segura de SELECT (sem afetar o answer_key)
CREATE POLICY demo_exercises_select_public
ON public.demo_exercises
FOR SELECT
TO anon, authenticated
USING (true);

-- 5) Recriar a VIEW pública sem o gabarito e com security_invoker
DROP VIEW IF EXISTS public.demo_exercises_public;
CREATE VIEW public.demo_exercises_public 
WITH (security_invoker = true) AS
SELECT id, title, content, skill_type, created_at, updated_at
FROM public.demo_exercises;

-- Configurar permissões na view
REVOKE ALL ON public.demo_exercises_public FROM PUBLIC;
GRANT SELECT ON public.demo_exercises_public TO anon, authenticated;

-- B) Corrigir views para não herdarem privilégios do criador

-- Aplicar security_invoker = true em todas as views existentes
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT quote_ident(schemaname) AS sch, quote_ident(viewname) AS vname
    FROM pg_views
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER VIEW %I.%I SET (security_invoker = true);', r.sch, r.vname);
  END LOOP;
END$$;

-- Criar policy especial para service_role acessar answer_key (edge functions)
CREATE POLICY demo_exercises_service_role_access
ON public.demo_exercises
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Documentar a configuração de segurança
COMMENT ON TABLE public.demo_exercises IS 
'SECURITY MODEL HARDENED:
- RLS enabled with column-level permissions
- anon/authenticated can only SELECT: id, title, content, skill_type, created_at, updated_at
- answer_key is ONLY accessible to service_role (edge functions)
- Public access via demo_exercises_public view (security_invoker)
- Answer validation happens server-side via edge functions';

COMMENT ON VIEW public.demo_exercises_public IS
'PUBLIC VIEW: Safe access to demo exercises without answer keys. Uses security_invoker for proper privilege handling.';