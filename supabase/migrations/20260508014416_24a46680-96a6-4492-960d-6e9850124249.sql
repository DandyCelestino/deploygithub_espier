-- Itens de orçamento (produtos do estoque ou descritivos)
CREATE TABLE public.orcamento_itens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id uuid NOT NULL,
  estoque_item_id uuid,
  descricao text NOT NULL,
  quantidade numeric NOT NULL DEFAULT 1,
  unidade text NOT NULL DEFAULT 'un',
  valor_total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orcamento_itens_orcamento ON public.orcamento_itens(orcamento_id);

ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gerente full access orc_itens"
ON public.orcamento_itens FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gerente'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gerente'));

CREATE POLICY "Financeiro can view orc_itens"
ON public.orcamento_itens FOR SELECT
USING (has_role(auth.uid(),'financeiro'));

CREATE POLICY "Tecnico can view orc_itens of approved"
ON public.orcamento_itens FOR SELECT
USING (
  has_role(auth.uid(),'tecnico') AND EXISTS (
    SELECT 1 FROM public.orcamentos o
    WHERE o.id = orcamento_itens.orcamento_id AND o.status = 'aprovado'
  )
);

-- Validade do orçamento (default 30 dias)
ALTER TABLE public.orcamentos
  ADD COLUMN IF NOT EXISTS validade_dias integer NOT NULL DEFAULT 30;