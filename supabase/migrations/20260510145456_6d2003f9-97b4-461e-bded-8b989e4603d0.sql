
-- 1. Estoque expansion
ALTER TABLE public.estoque_itens
  ADD COLUMN IF NOT EXISTS valor_compra numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_venda numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS descricao_produto text,
  ADD COLUMN IF NOT EXISTS usabilidade text,
  ADD COLUMN IF NOT EXISTS produtos_associados uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS categoria_uso text NOT NULL DEFAULT 'ambos';

-- 2. Orcamentos expansion
ALTER TABLE public.orcamentos
  ADD COLUMN IF NOT EXISTS cliente_id uuid,
  ADD COLUMN IF NOT EXISTS tipo_servico text NOT NULL DEFAULT 'avulso',
  ADD COLUMN IF NOT EXISTS valor_mensal numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS origem text NOT NULL DEFAULT 'interno',
  ADD COLUMN IF NOT EXISTS setor_responsavel text,
  ADD COLUMN IF NOT EXISTS vendedor_id uuid;

-- Allow anonymous insert from public site
DROP POLICY IF EXISTS "Public site can insert orcamentos" ON public.orcamentos;
CREATE POLICY "Public site can insert orcamentos"
ON public.orcamentos
FOR INSERT
TO anon, authenticated
WITH CHECK (origem = 'site' AND status = 'pendente');

-- Make criado_por nullable for site-origin
ALTER TABLE public.orcamentos ALTER COLUMN criado_por DROP NOT NULL;

-- 3. Vendedor commissions
CREATE TABLE IF NOT EXISTS public.vendedor_comissoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id uuid NOT NULL,
  orcamento_id uuid,
  ordem_servico_id uuid,
  tipo text NOT NULL DEFAULT 'avulsa', -- avulsa | recorrente
  valor numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'em_execucao', -- em_execucao | a_receber | pago | cancelado
  parcela_num int NOT NULL DEFAULT 1,
  parcela_total int NOT NULL DEFAULT 1,
  data_prevista date,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vendedor_comissoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin/gerente/financeiro full access comissoes" ON public.vendedor_comissoes;
CREATE POLICY "Admin/gerente/financeiro full access comissoes"
ON public.vendedor_comissoes
FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gerente') OR has_role(auth.uid(),'financeiro'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gerente') OR has_role(auth.uid(),'financeiro'));

DROP POLICY IF EXISTS "Vendedor view own comissoes" ON public.vendedor_comissoes;
CREATE POLICY "Vendedor view own comissoes"
ON public.vendedor_comissoes
FOR SELECT
USING (has_role(auth.uid(),'vendedor') AND vendedor_id = auth.uid());

CREATE TRIGGER trg_vendedor_comissoes_updated
BEFORE UPDATE ON public.vendedor_comissoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Trigger: when OS is created from approved orçamento -> em_execucao commission
CREATE OR REPLACE FUNCTION public.on_os_create_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _orc public.orcamentos%ROWTYPE;
  i int;
BEGIN
  IF NEW.orcamento_id IS NULL THEN RETURN NEW; END IF;
  SELECT * INTO _orc FROM public.orcamentos WHERE id = NEW.orcamento_id;
  IF _orc.vendedor_id IS NULL THEN RETURN NEW; END IF;

  IF _orc.tipo_servico = 'mensalidade' AND _orc.valor_mensal > 0 THEN
    FOR i IN 1..3 LOOP
      INSERT INTO public.vendedor_comissoes(vendedor_id, orcamento_id, ordem_servico_id, tipo, valor, status, parcela_num, parcela_total, data_prevista)
      VALUES (_orc.vendedor_id, _orc.id, NEW.id, 'recorrente',
              ROUND(_orc.valor_mensal * 0.10, 2),
              'em_execucao', i, 3,
              (CURRENT_DATE + (i || ' months')::interval)::date);
    END LOOP;
  ELSE
    INSERT INTO public.vendedor_comissoes(vendedor_id, orcamento_id, ordem_servico_id, tipo, valor, status, parcela_num, parcela_total, data_prevista)
    VALUES (_orc.vendedor_id, _orc.id, NEW.id, 'avulsa',
            ROUND(COALESCE(NEW.valor_instalacao, _orc.valor_total) * 0.10, 2),
            'em_execucao', 1, 1,
            (CURRENT_DATE + INTERVAL '15 days')::date);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_os_create_commission ON public.ordens_servico;
CREATE TRIGGER trg_os_create_commission
AFTER INSERT ON public.ordens_servico
FOR EACH ROW EXECUTE FUNCTION public.on_os_create_commission();

-- 5. Trigger: when OS supervisao approved -> move commission to a_receber + create monthly recurring billing
CREATE OR REPLACE FUNCTION public.on_os_finalizada_comissao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _orc public.orcamentos%ROWTYPE;
  i int;
BEGIN
  IF NEW.supervisao_aprovada = true AND (OLD.supervisao_aprovada IS DISTINCT FROM true) THEN
    UPDATE public.vendedor_comissoes
       SET status = 'a_receber', updated_at = now()
     WHERE ordem_servico_id = NEW.id AND status = 'em_execucao';

    IF NEW.orcamento_id IS NOT NULL THEN
      SELECT * INTO _orc FROM public.orcamentos WHERE id = NEW.orcamento_id;
      IF _orc.tipo_servico = 'mensalidade' AND _orc.valor_mensal > 0 THEN
        FOR i IN 1..12 LOOP
          INSERT INTO public.financeiro_contas(tipo, descricao, valor, data_vencimento, status, categoria, referencia_id, referencia_tipo, criado_por)
          VALUES ('receita',
                  'Mensalidade — ' || _orc.cliente_nome || ' (parcela ' || i || '/12)',
                  _orc.valor_mensal,
                  (CURRENT_DATE + (i || ' months')::interval)::date,
                  'pendente', 'mensalidade',
                  NEW.id, 'ordens_servico',
                  COALESCE(NEW.supervisao_por, _orc.vendedor_id, NEW.tecnico_id));
        END LOOP;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_os_finalizada_comissao ON public.ordens_servico;
CREATE TRIGGER trg_os_finalizada_comissao
AFTER UPDATE ON public.ordens_servico
FOR EACH ROW EXECUTE FUNCTION public.on_os_finalizada_comissao();
