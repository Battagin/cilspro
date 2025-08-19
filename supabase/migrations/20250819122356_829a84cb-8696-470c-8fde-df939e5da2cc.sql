SET check_function_bodies = false;
SET search_path = public;

-- 1) Schema privado para chaves/gabaritos
CREATE SCHEMA IF NOT EXISTS private;

-- 2) Garantir RLS na tabela pública
ALTER TABLE public.demo_exercises ENABLE ROW LEVEL SECURITY;

-- 3) Tabela privada com gabaritos
CREATE TABLE IF NOT EXISTS private.demo_exercise_keys (
  exercise_id uuid PRIMARY KEY REFERENCES public.demo_exercises(id) ON DELETE CASCADE,
  answer_key jsonb NOT NULL
);

-- 4) Migrar gabaritos (se a coluna ainda existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='demo_exercises' AND column_name='answer_key'
  ) THEN
    INSERT INTO private.demo_exercise_keys (exercise_id, answer_key)
    SELECT id, answer_key
    FROM public.demo_exercises
    WHERE answer_key IS NOT NULL
    ON CONFLICT (exercise_id) DO NOTHING;
  END IF;
END
$$;

-- 5) Revogar permissões amplas na tabela pública
REVOKE ALL ON public.demo_exercises FROM PUBLIC, anon, authenticated;

-- 6) Remover policies permissivas antigas
DROP POLICY IF EXISTS demo_exercises_service_role_only ON public.demo_exercises;
DROP POLICY IF EXISTS demo_exercises_select_public ON public.demo_exercises;
DROP POLICY IF EXISTS demo_exercises_service_role_access ON public.demo_exercises;

-- 7) Policy RLS segura (somente liberação de LINHAS; colunas serão controladas via VIEW)
CREATE POLICY demo_exercises_rls_select_rows
ON public.demo_exercises
FOR SELECT
TO anon, authenticated
USING (true);

-- 8) Remover VIEW pública antiga (se existir)
DROP VIEW IF EXISTS public.demo_exercises_public;

-- 9) Remover a coluna sensível da tabela pública
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='demo_exercises' AND column_name='answer_key'
  ) THEN
    ALTER TABLE public.demo_exercises DROP COLUMN answer_key;
  END IF;
END
$$;

-- 10) VIEW pública sem dados sensíveis
CREATE OR REPLACE VIEW public.demo_exercises_public AS
SELECT
  id,
  title,
  content,
  skill_type,
  created_at,
  updated_at
FROM public.demo_exercises;

-- 11) Permissões da VIEW pública
REVOKE ALL ON public.demo_exercises_public FROM PUBLIC;
GRANT SELECT ON public.demo_exercises_public TO anon, authenticated;

-- 12) Bloquear schema/tabelas privadas
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA private FROM PUBLIC, anon, authenticated;

-- 13) RLS na tabela privada e policy "fechada"
ALTER TABLE private.demo_exercise_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS demo_exercise_keys_service_only ON private.demo_exercise_keys;
CREATE POLICY demo_exercise_keys_service_only
ON private.demo_exercise_keys
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- 14) Garantir que todas as VIEWS rodem como INVOKER (não elevam privilégios)
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
END
$$;