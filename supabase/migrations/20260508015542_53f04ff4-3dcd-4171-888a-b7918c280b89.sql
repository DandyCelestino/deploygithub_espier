ALTER TABLE public.agenda_eventos
  ADD COLUMN IF NOT EXISTS target_roles app_role[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_user_ids uuid[] NOT NULL DEFAULT '{}';

-- Helper: check if current user matches any target role
CREATE OR REPLACE FUNCTION public.user_has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$;

DROP POLICY IF EXISTS "Authenticated can view agenda" ON public.agenda_eventos;

CREATE POLICY "Targeted users can view agenda"
ON public.agenda_eventos
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'gerente'::app_role)
    OR criado_por = auth.uid()
    OR auth.uid() = ANY(target_user_ids)
    OR (cardinality(target_roles) > 0 AND public.user_has_any_role(auth.uid(), target_roles))
    OR (cardinality(target_roles) = 0 AND cardinality(target_user_ids) = 0)
  )
);