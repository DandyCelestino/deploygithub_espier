
-- Create a security definer function to validate feedback insertion
CREATE OR REPLACE FUNCTION public.validate_feedback_os(_ordem_servico_id uuid, _codigo_rastreio text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ordens_servico
    WHERE id = _ordem_servico_id
      AND codigo_rastreio = _codigo_rastreio
  )
$$;

-- Drop the old policy
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.cliente_feedbacks;

-- Create new policy using the security definer function
CREATE POLICY "Anyone can insert feedback"
ON public.cliente_feedbacks
FOR INSERT
TO anon, authenticated
WITH CHECK (
  public.validate_feedback_os(ordem_servico_id, codigo_rastreio)
);
