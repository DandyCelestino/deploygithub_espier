-- Storage bucket público para fotos de OS
INSERT INTO storage.buckets (id, name, public)
VALUES ('os-fotos', 'os-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas do bucket
CREATE POLICY "OS fotos públicas para leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'os-fotos');

CREATE POLICY "Técnicos/gerentes/admins enviam fotos OS"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'os-fotos' AND (
    public.has_role(auth.uid(), 'tecnico'::app_role) OR
    public.has_role(auth.uid(), 'gerente'::app_role) OR
    public.has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Técnicos/gerentes/admins atualizam fotos OS"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'os-fotos' AND (
    public.has_role(auth.uid(), 'tecnico'::app_role) OR
    public.has_role(auth.uid(), 'gerente'::app_role) OR
    public.has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Admin/gerente apagam fotos OS"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'os-fotos' AND (
    public.has_role(auth.uid(), 'gerente'::app_role) OR
    public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Consulta pública por código de rastreio (somente leitura, sem dados sensíveis sensíveis tipo valor)
-- A função get_os_by_tracking_code já é SECURITY DEFINER e expõe somente campos seguros.
-- Permite que anon use a função (já é o padrão para SECURITY DEFINER + GRANT EXECUTE).
GRANT EXECUTE ON FUNCTION public.get_os_by_tracking_code(text) TO anon, authenticated;

-- Trigger: 1 OS ativa por técnico
CREATE OR REPLACE FUNCTION public.enforce_one_active_os_per_tecnico()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ativas int;
BEGIN
  -- Só checa quando atribui técnico OU muda status para em_andamento/aguardando_supervisao
  IF NEW.tecnico_id IS NOT NULL AND NEW.status IN ('em_andamento','aguardando_supervisao') THEN
    SELECT COUNT(*) INTO _ativas
    FROM public.ordens_servico
    WHERE tecnico_id = NEW.tecnico_id
      AND id <> NEW.id
      AND status IN ('em_andamento','aguardando_supervisao');
    IF _ativas > 0 THEN
      RAISE EXCEPTION 'Técnico já possui uma OS ativa. Conclua a OS atual antes de assumir outra.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_one_active_os ON public.ordens_servico;
CREATE TRIGGER trg_one_active_os
BEFORE INSERT OR UPDATE OF tecnico_id, status ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.enforce_one_active_os_per_tecnico();

-- Trigger: bloqueia "aguardando_supervisao" sem checklist 100%
CREATE OR REPLACE FUNCTION public.enforce_checklist_before_supervisao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'aguardando_supervisao' AND (OLD.status IS DISTINCT FROM 'aguardando_supervisao') THEN
    IF NOT (
      NEW.checklist_materiais AND NEW.checklist_instalacao AND NEW.checklist_teste AND
      NEW.checklist_limpeza AND NEW.checklist_fotos AND NEW.checklist_assinatura_cliente
    ) THEN
      RAISE EXCEPTION 'Checklist incompleto. Conclua todos os itens antes de solicitar vistoria.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_checklist_before_supervisao ON public.ordens_servico;
CREATE TRIGGER trg_checklist_before_supervisao
BEFORE UPDATE OF status ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.enforce_checklist_before_supervisao();

-- Trigger: ao aprovar supervisão, libera valor e cria conta a pagar para o técnico
CREATE OR REPLACE FUNCTION public.on_supervisao_aprovada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _comissao numeric;
BEGIN
  IF NEW.supervisao_aprovada = true AND (OLD.supervisao_aprovada IS DISTINCT FROM true) THEN
    NEW.valor_liberado := true;
    -- valor de comissão: 30% do valor de instalação (fallback). Se houver lógica financeira específica, ajustar.
    _comissao := COALESCE(NEW.valor_instalacao, 0) * 0.30;
    IF _comissao > 0 AND NEW.tecnico_id IS NOT NULL THEN
      INSERT INTO public.financeiro_contas (
        tipo, descricao, valor, data_vencimento, status, categoria,
        referencia_id, referencia_tipo, criado_por
      ) VALUES (
        'pagar',
        'Pagamento técnico — OS ' || COALESCE(NEW.codigo_rastreio, LEFT(NEW.id::text,8)) || ' — ' || NEW.cliente_nome,
        _comissao,
        (CURRENT_DATE + INTERVAL '7 days')::date,
        'pendente',
        'comissao_tecnico',
        NEW.id,
        'ordens_servico',
        COALESCE(NEW.supervisao_por, NEW.tecnico_id)
      );
    END IF;
    PERFORM public.log_activity(NEW.supervisao_por, 'os_supervisao_aprovada', 'ordens_servico', NEW.id,
      jsonb_build_object('valor_liberado', _comissao, 'tecnico_id', NEW.tecnico_id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_supervisao_aprovada ON public.ordens_servico;
CREATE TRIGGER trg_supervisao_aprovada
BEFORE UPDATE OF supervisao_aprovada ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.on_supervisao_aprovada();