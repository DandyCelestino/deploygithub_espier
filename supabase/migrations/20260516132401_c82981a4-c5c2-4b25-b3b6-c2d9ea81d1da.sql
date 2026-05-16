CREATE OR REPLACE FUNCTION public.on_orcamento_aprovado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _os_id uuid;
  _actor uuid;
BEGIN
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status <> 'aprovado') THEN
    SELECT id INTO _os_id
    FROM public.ordens_servico
    WHERE orcamento_id = NEW.id
    LIMIT 1;

    IF _os_id IS NULL THEN
      INSERT INTO public.ordens_servico (
        orcamento_id,
        cliente_nome,
        endereco,
        cidade,
        servico_solicitado,
        valor_instalacao,
        status
      ) VALUES (
        NEW.id,
        NEW.cliente_nome,
        COALESCE(NULLIF(NEW.endereco, ''), 'Endereço a confirmar'),
        COALESCE(NULLIF(NEW.cidade, ''), 'Cidade a confirmar'),
        NEW.servico_solicitado,
        COALESCE(NULLIF(NEW.valor_instalacao, 0), NEW.valor_total, 0),
        'aberta'
      )
      RETURNING id INTO _os_id;
    END IF;

    IF NEW.lead_id IS NOT NULL THEN
      UPDATE public.leads
      SET etapa = 'os_criada',
          orcamento_id = NEW.id,
          ordem_servico_id = _os_id,
          updated_at = now()
      WHERE id = NEW.lead_id;
    END IF;

    _actor := COALESCE(NEW.criado_por, NEW.vendedor_id);
    IF _actor IS NOT NULL THEN
      PERFORM public.log_activity(
        _actor,
        'orcamento_aprovado_os_criada',
        'orcamentos',
        NEW.id,
        jsonb_build_object(
          'ordem_servico_id', _os_id,
          'valor_total', NEW.valor_total,
          'cliente_nome', NEW.cliente_nome,
          'vendedor_id', NEW.vendedor_id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_os_create_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _orc public.orcamentos%ROWTYPE;
  _valor_base numeric;
  _valor_comissao numeric;
  i int;
BEGIN
  IF NEW.orcamento_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO _orc
  FROM public.orcamentos
  WHERE id = NEW.orcamento_id;

  IF _orc.id IS NULL OR _orc.vendedor_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.vendedor_comissoes
    WHERE ordem_servico_id = NEW.id
      AND vendedor_id = _orc.vendedor_id
  ) THEN
    RETURN NEW;
  END IF;

  IF _orc.tipo_servico = 'mensalidade' AND COALESCE(_orc.valor_mensal, 0) > 0 THEN
    FOR i IN 1..3 LOOP
      _valor_comissao := ROUND(_orc.valor_mensal * 0.10, 2);

      INSERT INTO public.vendedor_comissoes (
        vendedor_id,
        orcamento_id,
        ordem_servico_id,
        tipo,
        valor,
        status,
        parcela_num,
        parcela_total,
        data_prevista,
        observacao
      ) VALUES (
        _orc.vendedor_id,
        _orc.id,
        NEW.id,
        'recorrente',
        _valor_comissao,
        'a_receber',
        i,
        3,
        (CURRENT_DATE + ((i - 1) || ' months')::interval)::date,
        'Comissão gerada automaticamente na criação da OS'
      );
    END LOOP;
  ELSE
    _valor_base := COALESCE(NULLIF(NEW.valor_instalacao, 0), NULLIF(_orc.valor_instalacao, 0), _orc.valor_total, 0);
    _valor_comissao := ROUND(_valor_base * 0.10, 2);

    IF _valor_comissao > 0 THEN
      INSERT INTO public.vendedor_comissoes (
        vendedor_id,
        orcamento_id,
        ordem_servico_id,
        tipo,
        valor,
        status,
        parcela_num,
        parcela_total,
        data_prevista,
        observacao
      ) VALUES (
        _orc.vendedor_id,
        _orc.id,
        NEW.id,
        'avulsa',
        _valor_comissao,
        'a_receber',
        1,
        1,
        CURRENT_DATE,
        'Comissão gerada automaticamente na criação da OS'
      );
    END IF;
  END IF;

  INSERT INTO public.agenda_eventos (
    titulo,
    descricao,
    tipo,
    data_inicio,
    data_fim,
    criado_por,
    target_user_ids,
    target_roles
  ) VALUES (
    'Comissão a receber — ' || COALESCE(NEW.cliente_nome, _orc.cliente_nome),
    'OS criada automaticamente. Comissão disponível no dashboard do vendedor.',
    'notificacao',
    now(),
    now(),
    COALESCE(_orc.criado_por, _orc.vendedor_id),
    ARRAY[_orc.vendedor_id],
    ARRAY[]::public.app_role[]
  );

  RETURN NEW;
END;
$$;

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
     WHERE ordem_servico_id = NEW.id
       AND status = 'em_execucao';

    IF NEW.orcamento_id IS NOT NULL THEN
      SELECT * INTO _orc FROM public.orcamentos WHERE id = NEW.orcamento_id;
      IF _orc.tipo_servico = 'mensalidade' AND COALESCE(_orc.valor_mensal, 0) > 0 THEN
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
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS vendedor_comissoes_os_parcela_unique
ON public.vendedor_comissoes (ordem_servico_id, vendedor_id, parcela_num)
WHERE ordem_servico_id IS NOT NULL;

DROP TRIGGER IF EXISTS trigger_orcamento_aprovado ON public.orcamentos;
DROP TRIGGER IF EXISTS on_orcamento_aprovado_trigger ON public.orcamentos;
CREATE TRIGGER on_orcamento_aprovado_trigger
AFTER UPDATE ON public.orcamentos
FOR EACH ROW
EXECUTE FUNCTION public.on_orcamento_aprovado();

DROP TRIGGER IF EXISTS trg_os_create_commission ON public.ordens_servico;
CREATE TRIGGER trg_os_create_commission
AFTER INSERT ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.on_os_create_commission();

DROP TRIGGER IF EXISTS trg_os_finalizada_comissao ON public.ordens_servico;
CREATE TRIGGER trg_os_finalizada_comissao
AFTER UPDATE ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.on_os_finalizada_comissao();

DROP TRIGGER IF EXISTS trigger_os_status_change ON public.ordens_servico;
DROP TRIGGER IF EXISTS on_os_status_change_trigger ON public.ordens_servico;
CREATE TRIGGER on_os_status_change_trigger
AFTER UPDATE ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.on_os_status_change();