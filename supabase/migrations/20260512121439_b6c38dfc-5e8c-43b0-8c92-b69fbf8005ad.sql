
-- Tabela principal de leads (CRM)
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  nome text NOT NULL,
  empresa text,
  telefone text,
  whatsapp text,
  email text,
  cidade text,
  estado text DEFAULT 'SP',
  servico_interesse text,
  valor_estimado numeric NOT NULL DEFAULT 0,
  etapa text NOT NULL DEFAULT 'novo_lead',
  prioridade text NOT NULL DEFAULT 'media',
  tags text[] NOT NULL DEFAULT '{}',
  origem text DEFAULT 'manual',
  proxima_acao text,
  proxima_acao_data timestamptz,
  ultimo_contato timestamptz,
  foto_url text,
  observacoes_internas text,
  vendedor_id uuid NOT NULL,
  vendedor_nome text,
  orcamento_id uuid REFERENCES public.orcamentos(id) ON DELETE SET NULL,
  contrato_id uuid REFERENCES public.contratos(id) ON DELETE SET NULL,
  ordem_servico_id uuid REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  motivo_perda text,
  etapa_changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_vendedor ON public.leads(vendedor_id);
CREATE INDEX idx_leads_etapa ON public.leads(etapa);
CREATE INDEX idx_leads_prioridade ON public.leads(prioridade);

-- Trigger atualizar etapa_changed_at quando etapa muda
CREATE OR REPLACE FUNCTION public.on_lead_etapa_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.etapa IS DISTINCT FROM OLD.etapa THEN
    NEW.etapa_changed_at = now();
    INSERT INTO public.lead_atividades(lead_id, autor_id, tipo, descricao)
    VALUES (NEW.id, auth.uid(), 'mudanca_etapa',
      'Etapa alterada: ' || COALESCE(OLD.etapa,'-') || ' → ' || NEW.etapa);
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_leads_updated
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gerente full access leads" ON public.leads FOR ALL
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gerente'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gerente'));

CREATE POLICY "Vendedor manages own leads" ON public.leads FOR ALL
  USING (has_role(auth.uid(),'vendedor') AND vendedor_id = auth.uid())
  WITH CHECK (has_role(auth.uid(),'vendedor') AND vendedor_id = auth.uid());

CREATE POLICY "Financeiro views leads" ON public.leads FOR SELECT
  USING (has_role(auth.uid(),'financeiro'));

-- Atividades / timeline do lead
CREATE TABLE public.lead_atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  autor_id uuid,
  autor_nome text,
  tipo text NOT NULL DEFAULT 'observacao',
  descricao text NOT NULL,
  anexo_url text,
  data_evento timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_ativ_lead ON public.lead_atividades(lead_id);

ALTER TABLE public.lead_atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gerente full access lead_ativ" ON public.lead_atividades FOR ALL
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gerente'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gerente'));

CREATE POLICY "Vendedor sees own lead activities" ON public.lead_atividades FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id AND l.vendedor_id = auth.uid()));

CREATE POLICY "Vendedor inserts own lead activities" ON public.lead_atividades FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id AND l.vendedor_id = auth.uid()));

CREATE TRIGGER trg_lead_etapa_change
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.on_lead_etapa_change();

-- Metas mensais por vendedor
CREATE TABLE public.vendedor_metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id uuid NOT NULL,
  ano int NOT NULL,
  mes int NOT NULL CHECK (mes BETWEEN 1 AND 12),
  meta_valor numeric NOT NULL DEFAULT 0,
  meta_vendas int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(vendedor_id, ano, mes)
);

CREATE TRIGGER trg_metas_updated
  BEFORE UPDATE ON public.vendedor_metas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.vendedor_metas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gerente full access metas" ON public.vendedor_metas FOR ALL
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gerente'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gerente'));

CREATE POLICY "Vendedor manages own metas" ON public.vendedor_metas FOR ALL
  USING (vendedor_id = auth.uid())
  WITH CHECK (vendedor_id = auth.uid());

CREATE POLICY "Financeiro views metas" ON public.vendedor_metas FOR SELECT
  USING (has_role(auth.uid(),'financeiro'));
