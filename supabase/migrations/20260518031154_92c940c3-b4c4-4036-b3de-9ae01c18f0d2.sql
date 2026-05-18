-- 1. Add detailed contract fields
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS numero_contrato text,
  ADD COLUMN IF NOT EXISTS objeto text,
  ADD COLUMN IF NOT EXISTS prazo_execucao_dias integer,
  ADD COLUMN IF NOT EXISTS forma_pagamento text,
  ADD COLUMN IF NOT EXISTS valor_mensal numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS garantia_meses integer NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS sla_resposta_horas integer NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS observacoes text,
  ADD COLUMN IF NOT EXISTS itens jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS data_assinatura timestamptz,
  ADD COLUMN IF NOT EXISTS assinatura_nome text,
  ADD COLUMN IF NOT EXISTS assinatura_cpf text,
  ADD COLUMN IF NOT EXISTS assinatura_ip text,
  ADD COLUMN IF NOT EXISTS token_publico uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS enviado_whatsapp_em timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS contratos_token_publico_idx ON public.contratos(token_publico);
CREATE UNIQUE INDEX IF NOT EXISTS contratos_numero_idx ON public.contratos(numero_contrato) WHERE numero_contrato IS NOT NULL;

-- 2. Auto numbering trigger
CREATE OR REPLACE FUNCTION public.set_contrato_numero()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ano int := EXTRACT(YEAR FROM now());
  _seq int;
BEGIN
  IF NEW.numero_contrato IS NULL THEN
    SELECT COUNT(*) + 1 INTO _seq
      FROM public.contratos
      WHERE EXTRACT(YEAR FROM created_at) = _ano;
    NEW.numero_contrato := 'CT-' || _ano || '-' || LPAD(_seq::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contrato_numero ON public.contratos;
CREATE TRIGGER trg_contrato_numero BEFORE INSERT ON public.contratos
FOR EACH ROW EXECUTE FUNCTION public.set_contrato_numero();

-- 3. Public RPC to fetch contract by token (anonymous-safe, read-only)
CREATE OR REPLACE FUNCTION public.get_contrato_by_token(_token uuid)
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'contrato', json_build_object(
      'id', c.id,
      'numero_contrato', c.numero_contrato,
      'status', c.status,
      'objeto', c.objeto,
      'total_value', c.total_value,
      'valor_mensal', c.valor_mensal,
      'prazo_execucao_dias', c.prazo_execucao_dias,
      'forma_pagamento', c.forma_pagamento,
      'garantia_meses', c.garantia_meses,
      'sla_resposta_horas', c.sla_resposta_horas,
      'observacoes', c.observacoes,
      'itens', c.itens,
      'created_at', c.created_at,
      'data_assinatura', c.data_assinatura,
      'assinatura_nome', c.assinatura_nome
    ),
    'cliente', json_build_object(
      'name', cl.name, 'document', cl.document, 'email', cl.email,
      'phone', cl.phone, 'address', cl.address, 'city', cl.city, 'state', cl.state, 'cep', cl.cep,
      'tipo_pessoa', cl.tipo_pessoa
    )
  )
  FROM public.contratos c
  LEFT JOIN public.clientes cl ON cl.id = c.client_id
  WHERE c.token_publico = _token;
$$;

-- 4. Public RPC for digital acceptance
CREATE OR REPLACE FUNCTION public.assinar_contrato(_token uuid, _nome text, _cpf text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _c public.contratos%ROWTYPE;
BEGIN
  SELECT * INTO _c FROM public.contratos WHERE token_publico = _token;
  IF _c.id IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'contrato_nao_encontrado');
  END IF;
  IF _c.data_assinatura IS NOT NULL THEN
    RETURN json_build_object('ok', false, 'error', 'ja_assinado');
  END IF;
  IF length(coalesce(trim(_nome),'')) < 3 OR length(coalesce(trim(_cpf),'')) < 11 THEN
    RETURN json_build_object('ok', false, 'error', 'dados_invalidos');
  END IF;
  UPDATE public.contratos
     SET data_assinatura = now(),
         assinatura_nome = trim(_nome),
         assinatura_cpf = trim(_cpf),
         status = 'fechado',
         updated_at = now()
   WHERE id = _c.id;
  RETURN json_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_contrato_by_token(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assinar_contrato(uuid, text, text) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_contrato_numero() FROM anon, authenticated;