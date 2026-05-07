
-- =========================================
-- 1) Expandir clientes
-- =========================================
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS tipo_pessoa text DEFAULT 'fisica',
  ADD COLUMN IF NOT EXISTS observacoes text;

-- =========================================
-- 2) Checklist de vistoria do gerente em ordens_servico
-- =========================================
ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS vistoria_checklist_seguranca boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS vistoria_checklist_qualidade boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS vistoria_checklist_documentacao boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS vistoria_observacoes text,
  ADD COLUMN IF NOT EXISTS vistoria_motivo_reprovacao text;

-- =========================================
-- 3) Tabela visitas (vendedor)
-- =========================================
CREATE TABLE IF NOT EXISTS public.visitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id uuid NOT NULL,
  vendedor_nome text,
  cliente_id uuid,
  cliente_nome text NOT NULL,
  cliente_telefone text,
  cliente_email text,
  endereco text,
  cidade text,
  data_visita timestamptz NOT NULL,
  servico_descricao text,
  valor_estimado numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'agendada', -- agendada | realizada | cancelada
  autoriza_orcamento boolean NOT NULL DEFAULT false,
  orcamento_id uuid,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gerente full access visitas" ON public.visitas
  FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'gerente'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'gerente'));

CREATE POLICY "Vendedor manages own visitas" ON public.visitas
  FOR ALL USING (public.has_role(auth.uid(),'vendedor') AND vendedor_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(),'vendedor') AND vendedor_id = auth.uid());

CREATE TRIGGER trg_visitas_updated BEFORE UPDATE ON public.visitas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: visita realizada com autoriza_orcamento → cria orçamento
CREATE OR REPLACE FUNCTION public.on_visita_autoriza_orcamento()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _orc_id uuid;
BEGIN
  IF NEW.status = 'realizada' AND NEW.autoriza_orcamento = true
     AND (OLD IS NULL OR OLD.status <> 'realizada' OR OLD.autoriza_orcamento <> true)
     AND NEW.orcamento_id IS NULL THEN
    INSERT INTO public.orcamentos (
      criado_por, cliente_nome, cliente_telefone, cliente_email,
      endereco, cidade, estado, servico_solicitado, valor_total, valor_instalacao, status
    ) VALUES (
      NEW.vendedor_id, NEW.cliente_nome, NEW.cliente_telefone, NEW.cliente_email,
      COALESCE(NEW.endereco,''), COALESCE(NEW.cidade,''), 'SP',
      COALESCE(NEW.servico_descricao,'Serviço a definir'),
      NEW.valor_estimado, NEW.valor_estimado, 'pendente'
    ) RETURNING id INTO _orc_id;
    NEW.orcamento_id := _orc_id;
    PERFORM public.log_activity(NEW.vendedor_id,'visita_gerou_orcamento','visitas',NEW.id,
      jsonb_build_object('orcamento_id',_orc_id,'cliente_nome',NEW.cliente_nome));
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_visita_autoriza_orcamento BEFORE INSERT OR UPDATE ON public.visitas
  FOR EACH ROW EXECUTE FUNCTION public.on_visita_autoriza_orcamento();

-- =========================================
-- 4) Agenda compartilhada
-- =========================================
CREATE TABLE IF NOT EXISTS public.agenda_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL DEFAULT 'outro', -- visita | os | reuniao | manutencao | outro
  data_inicio timestamptz NOT NULL,
  data_fim timestamptz,
  local text,
  participantes uuid[] DEFAULT '{}',
  ordem_servico_id uuid,
  cliente_id uuid,
  criado_por uuid NOT NULL,
  criado_por_nome text,
  status text NOT NULL DEFAULT 'agendado', -- agendado | concluido | cancelado
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view agenda" ON public.agenda_eventos
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can create agenda" ON public.agenda_eventos
  FOR INSERT WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "Owner or admin/gerente can update agenda" ON public.agenda_eventos
  FOR UPDATE USING (
    criado_por = auth.uid()
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'gerente')
  );

CREATE POLICY "Owner or admin can delete agenda" ON public.agenda_eventos
  FOR DELETE USING (
    criado_por = auth.uid()
    OR public.has_role(auth.uid(),'admin')
  );

CREATE TRIGGER trg_agenda_updated BEFORE UPDATE ON public.agenda_eventos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- 5) Permissões granulares
-- =========================================
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module text NOT NULL,
  can_view boolean NOT NULL DEFAULT false,
  can_create boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages permissions" ON public.user_permissions
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users view own permissions" ON public.user_permissions
  FOR SELECT USING (user_id = auth.uid());

CREATE TRIGGER trg_perms_updated BEFORE UPDATE ON public.user_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- 6) Índices úteis
-- =========================================
CREATE INDEX IF NOT EXISTS idx_os_tracking ON public.ordens_servico (codigo_rastreio);
CREATE INDEX IF NOT EXISTS idx_os_status ON public.ordens_servico (status);
CREATE INDEX IF NOT EXISTS idx_os_tecnico ON public.ordens_servico (tecnico_id);
CREATE INDEX IF NOT EXISTS idx_visitas_vendedor ON public.visitas (vendedor_id);
CREATE INDEX IF NOT EXISTS idx_agenda_data ON public.agenda_eventos (data_inicio);
