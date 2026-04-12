
-- 1. Create clientes table
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  document text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admin/gerente full access clientes" ON public.clientes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'));

CREATE POLICY "Vendedor can view all clientes" ON public.clientes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'vendedor'));

CREATE POLICY "Vendedor can insert clientes" ON public.clientes
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'vendedor'));

CREATE POLICY "Vendedor can update own clientes" ON public.clientes
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'vendedor') AND created_by = auth.uid());

-- 2. Create contratos table
CREATE TABLE public.contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  vendedor_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'em_negociacao',
  total_value numeric NOT NULL DEFAULT 0,
  commission_value numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_contratos_updated_at
  BEFORE UPDATE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admin/gerente full access contratos" ON public.contratos
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'));

CREATE POLICY "Vendedor can view own contratos" ON public.contratos
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'vendedor') AND vendedor_id = auth.uid());

CREATE POLICY "Vendedor can insert own contratos" ON public.contratos
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'vendedor') AND vendedor_id = auth.uid());

CREATE POLICY "Vendedor can update own contratos" ON public.contratos
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'vendedor') AND vendedor_id = auth.uid());

CREATE POLICY "Financeiro can view contratos" ON public.contratos
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeiro'));

-- 3. Create activity_logs table
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gerente can view logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'));

CREATE POLICY "System can insert logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 4. Add columns to orcamentos
ALTER TABLE public.orcamentos
  ADD COLUMN IF NOT EXISTS commission_value numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contrato_id uuid REFERENCES public.contratos(id) ON DELETE SET NULL;

-- 5. log_activity function
CREATE OR REPLACE FUNCTION public.log_activity(
  _user_id uuid,
  _action text,
  _entity_type text,
  _entity_id uuid,
  _details jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (_user_id, _action, _entity_type, _entity_id, _details);
$$;

-- 6. Trigger: contrato fechado -> cria orcamento
CREATE OR REPLACE FUNCTION public.on_contrato_fechado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cliente public.clientes%ROWTYPE;
BEGIN
  IF NEW.status = 'fechado' AND (OLD.status IS NULL OR OLD.status <> 'fechado') THEN
    SELECT * INTO _cliente FROM public.clientes WHERE id = NEW.client_id;
    
    INSERT INTO public.orcamentos (
      contrato_id, criado_por, cliente_nome, cliente_email, cliente_telefone,
      endereco, cidade, estado, servico_solicitado, valor_total, commission_value, status
    ) VALUES (
      NEW.id, NEW.vendedor_id, _cliente.name, _cliente.email, _cliente.phone,
      '', '', 'SP', 'Serviço do contrato #' || LEFT(NEW.id::text, 8),
      NEW.total_value, NEW.commission_value, 'pendente'
    );
    
    PERFORM public.log_activity(NEW.vendedor_id, 'contrato_fechado', 'contratos', NEW.id,
      jsonb_build_object('total_value', NEW.total_value, 'client_id', NEW.client_id));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_contrato_fechado
  AFTER UPDATE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION public.on_contrato_fechado();

-- 7. Trigger: orcamento aprovado -> cria OS
CREATE OR REPLACE FUNCTION public.on_orcamento_aprovado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status <> 'aprovado') THEN
    INSERT INTO public.ordens_servico (
      orcamento_id, cliente_nome, endereco, cidade,
      servico_solicitado, valor_instalacao, status
    ) VALUES (
      NEW.id, NEW.cliente_nome, NEW.endereco, NEW.cidade,
      NEW.servico_solicitado, NEW.valor_instalacao, 'aberta'
    );
    
    PERFORM public.log_activity(NEW.criado_por, 'orcamento_aprovado', 'orcamentos', NEW.id,
      jsonb_build_object('valor_total', NEW.valor_total, 'cliente_nome', NEW.cliente_nome));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_orcamento_aprovado
  AFTER UPDATE ON public.orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.on_orcamento_aprovado();

-- 8. Trigger: log OS status changes
CREATE OR REPLACE FUNCTION public.on_os_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status <> OLD.status THEN
    PERFORM public.log_activity(
      COALESCE(NEW.tecnico_id, NEW.supervisao_por),
      'os_status_' || NEW.status,
      'ordens_servico',
      NEW.id,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status, 'cliente_nome', NEW.cliente_nome)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_os_status_change
  AFTER UPDATE ON public.ordens_servico
  FOR EACH ROW EXECUTE FUNCTION public.on_os_status_change();

-- 9. Vendedor can view orcamentos linked to their contratos
CREATE POLICY "Vendedor can view own orcamentos" ON public.orcamentos
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'vendedor') AND 
    contrato_id IN (SELECT id FROM public.contratos WHERE vendedor_id = auth.uid())
  );
