
-- Add new columns to ordens_servico
ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS prazo_termino date,
  ADD COLUMN IF NOT EXISTS valor_instalacao numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS checklist_materiais boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checklist_instalacao boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checklist_teste boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checklist_limpeza boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checklist_fotos boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checklist_assinatura_cliente boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS supervisao_aprovada boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS supervisao_por uuid,
  ADD COLUMN IF NOT EXISTS supervisao_data timestamptz,
  ADD COLUMN IF NOT EXISTS valor_liberado boolean NOT NULL DEFAULT false;

-- Add valor_instalacao to orcamentos
ALTER TABLE public.orcamentos
  ADD COLUMN IF NOT EXISTS valor_instalacao numeric NOT NULL DEFAULT 0;
