
-- Orçamentos
CREATE TABLE public.orcamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  cliente_email TEXT,
  endereco TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'SP',
  servico_solicitado TEXT NOT NULL,
  descricao TEXT,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','rejeitado','finalizado')),
  criado_por UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gerente full access orcamentos" ON public.orcamentos FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'));

CREATE POLICY "Tecnico can view approved orcamentos" ON public.orcamentos FOR SELECT
  USING (has_role(auth.uid(), 'tecnico') AND status = 'aprovado');

CREATE POLICY "Financeiro can view orcamentos" ON public.orcamentos FOR SELECT
  USING (has_role(auth.uid(), 'financeiro'));

CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON public.orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ordens de Serviço
CREATE TABLE public.ordens_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE SET NULL,
  cliente_nome TEXT NOT NULL,
  endereco TEXT NOT NULL,
  cidade TEXT NOT NULL,
  servico_solicitado TEXT NOT NULL,
  tecnico_id UUID,
  tecnico_nome TEXT,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta','em_andamento','concluida','cancelada')),
  observacoes TEXT,
  data_inicio TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gerente full access ordens" ON public.ordens_servico FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'));

CREATE POLICY "Tecnico can view ordens" ON public.ordens_servico FOR SELECT
  USING (has_role(auth.uid(), 'tecnico'));

CREATE POLICY "Tecnico can update own ordens" ON public.ordens_servico FOR UPDATE
  USING (has_role(auth.uid(), 'tecnico') AND tecnico_id = auth.uid());

CREATE POLICY "Financeiro can view ordens" ON public.ordens_servico FOR SELECT
  USING (has_role(auth.uid(), 'financeiro'));

CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON public.ordens_servico
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Estoque - Itens
CREATE TABLE public.estoque_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL,
  codigo TEXT,
  unidade TEXT NOT NULL DEFAULT 'un',
  quantidade INTEGER NOT NULL DEFAULT 0,
  quantidade_minima INTEGER NOT NULL DEFAULT 0,
  localizacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.estoque_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gerente full access estoque" ON public.estoque_itens FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'));

CREATE POLICY "Tecnico can view estoque" ON public.estoque_itens FOR SELECT
  USING (has_role(auth.uid(), 'tecnico'));

CREATE POLICY "Financeiro can view estoque" ON public.estoque_itens FOR SELECT
  USING (has_role(auth.uid(), 'financeiro'));

CREATE TRIGGER update_estoque_itens_updated_at BEFORE UPDATE ON public.estoque_itens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Estoque - Movimentações
CREATE TABLE public.estoque_movimentacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.estoque_itens(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada','saida')),
  quantidade INTEGER NOT NULL,
  tecnico_id UUID,
  tecnico_nome TEXT,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gerente full access movimentacoes" ON public.estoque_movimentacoes FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'));

CREATE POLICY "Tecnico can view movimentacoes" ON public.estoque_movimentacoes FOR SELECT
  USING (has_role(auth.uid(), 'tecnico'));

CREATE POLICY "Tecnico can insert saida" ON public.estoque_movimentacoes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'tecnico') AND tipo = 'saida');

CREATE POLICY "Financeiro can view movimentacoes" ON public.estoque_movimentacoes FOR SELECT
  USING (has_role(auth.uid(), 'financeiro'));

-- Financeiro - Contas
CREATE TABLE public.financeiro_contas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('pagar','receber')),
  descricao TEXT NOT NULL,
  valor NUMERIC(12,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','pago','vencido','cancelado')),
  categoria TEXT,
  referencia_id UUID,
  referencia_tipo TEXT,
  criado_por UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financeiro_contas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gerente full access financeiro" ON public.financeiro_contas FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'));

CREATE POLICY "Financeiro full access contas" ON public.financeiro_contas FOR ALL
  USING (has_role(auth.uid(), 'financeiro'));

CREATE TRIGGER update_financeiro_contas_updated_at BEFORE UPDATE ON public.financeiro_contas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Configurações do sistema
CREATE TABLE public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT,
  descricao TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access configuracoes" ON public.configuracoes FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated can view configuracoes" ON public.configuracoes FOR SELECT
  USING (auth.uid() IS NOT NULL);
