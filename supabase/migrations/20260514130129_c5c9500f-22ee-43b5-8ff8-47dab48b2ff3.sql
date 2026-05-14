
ALTER TABLE public.visitas
  ADD COLUMN IF NOT EXISTS assumida_por uuid,
  ADD COLUMN IF NOT EXISTS assumida_em timestamptz,
  ADD COLUMN IF NOT EXISTS lead_id uuid;

ALTER TABLE public.orcamentos
  ADD COLUMN IF NOT EXISTS assumido_por uuid,
  ADD COLUMN IF NOT EXISTS assumido_em timestamptz,
  ADD COLUMN IF NOT EXISTS forma_pagamento text,
  ADD COLUMN IF NOT EXISTS parcelas int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS entrada numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS desconto numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contrato_enviado_em timestamptz,
  ADD COLUMN IF NOT EXISTS visita_id uuid,
  ADD COLUMN IF NOT EXISTS lead_id uuid;

ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS orcamento_id uuid,
  ADD COLUMN IF NOT EXISTS lead_id uuid,
  ADD COLUMN IF NOT EXISTS enviado_em timestamptz;

-- Permitir financeiro atualizar orçamentos que ele assumiu
DROP POLICY IF EXISTS "Financeiro can update assumed orcamentos" ON public.orcamentos;
CREATE POLICY "Financeiro can update assumed orcamentos"
ON public.orcamentos
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'financeiro'::app_role) AND (assumido_por = auth.uid() OR assumido_por IS NULL))
WITH CHECK (has_role(auth.uid(), 'financeiro'::app_role));

-- Permitir gerente/admin/financeiro atualizar visita (assumir)
DROP POLICY IF EXISTS "Gerente can update visitas to assume" ON public.visitas;
CREATE POLICY "Gerente can update visitas to assume"
ON public.visitas
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'gerente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Permitir financeiro/gerente/admin inserir contratos
DROP POLICY IF EXISTS "Authorized roles can insert contratos" ON public.contratos;
CREATE POLICY "Authorized roles can insert contratos"
ON public.contratos
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'gerente'::app_role) OR
  has_role(auth.uid(), 'financeiro'::app_role) OR
  has_role(auth.uid(), 'vendedor'::app_role)
);
