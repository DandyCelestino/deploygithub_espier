
-- Vendedor pode inserir solicitação de orçamento
CREATE POLICY "Vendedor can insert orcamento solicitado"
ON public.orcamentos
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'vendedor'::app_role)
  AND vendedor_id = auth.uid()
  AND status IN ('solicitado','pendente')
);

-- Vendedor pode atualizar enquanto solicitado
CREATE POLICY "Vendedor can update own solicitado orcamento"
ON public.orcamentos
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'vendedor'::app_role)
  AND vendedor_id = auth.uid()
  AND status = 'solicitado'
);

-- Vendedor pode visualizar orçamentos que são seus (por vendedor_id)
CREATE POLICY "Vendedor can view own orcamentos by vendedor_id"
ON public.orcamentos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'vendedor'::app_role)
  AND vendedor_id = auth.uid()
);
