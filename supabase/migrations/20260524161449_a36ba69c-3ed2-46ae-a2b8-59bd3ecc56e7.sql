
-- 1) os-fotos: tornar privado e restringir SELECT
UPDATE storage.buckets SET public = false WHERE id = 'os-fotos';

DROP POLICY IF EXISTS "OS fotos públicas para leitura" ON storage.objects;

CREATE POLICY "Roles can view os-fotos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'os-fotos' AND (
    public.has_role(auth.uid(), 'tecnico'::public.app_role)
    OR public.has_role(auth.uid(), 'gerente'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- 2) relatorios-fotos: restringir SELECT por role/ownership
DROP POLICY IF EXISTS "Authenticated can view report photos" ON storage.objects;

CREATE POLICY "Gerente/admin can view all report photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'relatorios-fotos' AND (
    public.has_role(auth.uid(), 'gerente'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

CREATE POLICY "Tecnico can view own report photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'relatorios-fotos'
  AND public.has_role(auth.uid(), 'tecnico'::public.app_role)
  AND owner = auth.uid()
);

-- 3) candidaturas: INSERT público restrito (sem permitir setar campos internos)
DROP POLICY IF EXISTS "Anyone can submit candidatura" ON public.candidaturas;

CREATE POLICY "Anyone can submit candidatura"
ON public.candidaturas FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pendente'
  AND avaliado_por IS NULL
  AND avaliado_em IS NULL
  AND user_id_criado IS NULL
  AND observacoes_internas IS NULL
);

-- 4) orcamento_itens: vendedor pode ver itens dos próprios orçamentos
CREATE POLICY "Vendedor can view own orc_itens"
ON public.orcamento_itens FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'vendedor'::public.app_role)
  AND EXISTS (
    SELECT 1 FROM public.orcamentos o
    WHERE o.id = orcamento_itens.orcamento_id
      AND o.vendedor_id = auth.uid()
  )
);

-- 5) user_roles: WITH CHECK explícito na política de admin
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 6) Revogar EXECUTE público de funções SECURITY DEFINER que NÃO devem ser RPC públicas
-- (mantemos has_role, user_has_any_role, get_contrato_by_token, assinar_contrato,
--  get_os_by_tracking_code, validate_feedback_os — usadas em RLS ou pelo portal público).

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_contrato_fechado() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_os_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_lead_etapa_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_os_finalizada_comissao() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_one_active_os_per_tecnico() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_checklist_before_supervisao() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_orcamento_aprovado() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_os_create_commission() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_visita_autoriza_orcamento() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_supervisao_aprovada() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_contrato_numero() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_activity(uuid, text, text, uuid, jsonb) FROM PUBLIC, anon;
