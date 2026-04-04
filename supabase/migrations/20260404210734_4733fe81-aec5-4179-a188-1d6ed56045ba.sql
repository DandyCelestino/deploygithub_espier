
-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Tecnico can update own ordens" ON public.ordens_servico;

-- Create new policy: tecnico can update their own orders OR accept open orders (tecnico_id is null and status is 'aberta')
CREATE POLICY "Tecnico can update ordens"
ON public.ordens_servico
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'tecnico'::app_role)
  AND (
    tecnico_id = auth.uid()
    OR (tecnico_id IS NULL AND status = 'aberta')
  )
);
