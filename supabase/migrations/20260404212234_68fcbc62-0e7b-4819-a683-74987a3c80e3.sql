
-- Add tracking code to ordens_servico
ALTER TABLE public.ordens_servico 
ADD COLUMN IF NOT EXISTS codigo_rastreio text UNIQUE DEFAULT substr(md5(random()::text), 1, 8);

-- Update existing rows that might have null
UPDATE public.ordens_servico SET codigo_rastreio = substr(md5(random()::text), 1, 8) WHERE codigo_rastreio IS NULL;

ALTER TABLE public.ordens_servico ALTER COLUMN codigo_rastreio SET NOT NULL;

-- Create relatorios_diarios table
CREATE TABLE public.relatorios_diarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id uuid NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  tecnico_id uuid NOT NULL,
  tecnico_nome text,
  descricao text NOT NULL,
  fotos text[] DEFAULT '{}',
  data_relatorio date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.relatorios_diarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tecnico can insert own reports"
ON public.relatorios_diarios FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'tecnico'::app_role) AND tecnico_id = auth.uid());

CREATE POLICY "Tecnico can view own reports"
ON public.relatorios_diarios FOR SELECT TO authenticated
USING (tecnico_id = auth.uid());

CREATE POLICY "Admin/gerente can view all reports"
ON public.relatorios_diarios FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role));

-- Create cliente_feedbacks table
CREATE TABLE public.cliente_feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id uuid NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  codigo_rastreio text NOT NULL,
  tipo text NOT NULL DEFAULT 'satisfacao',
  mensagem text,
  nota integer CHECK (nota >= 1 AND nota <= 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cliente_feedbacks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback (public, no auth needed) - validated by codigo_rastreio
CREATE POLICY "Anyone can insert feedback"
ON public.cliente_feedbacks FOR INSERT TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ordens_servico 
    WHERE id = ordem_servico_id AND codigo_rastreio = cliente_feedbacks.codigo_rastreio
  )
);

-- Admin/gerente can view all feedbacks
CREATE POLICY "Admin/gerente can view feedbacks"
ON public.cliente_feedbacks FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role));

-- Create a function to get OS data by tracking code (public, no auth)
CREATE OR REPLACE FUNCTION public.get_os_by_tracking_code(_codigo text)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'ordem', (
      SELECT json_build_object(
        'id', os.id,
        'cliente_nome', os.cliente_nome,
        'servico_solicitado', os.servico_solicitado,
        'status', os.status,
        'created_at', os.created_at,
        'prazo_termino', os.prazo_termino,
        'data_inicio', os.data_inicio,
        'data_conclusao', os.data_conclusao,
        'checklist_materiais', os.checklist_materiais,
        'checklist_instalacao', os.checklist_instalacao,
        'checklist_teste', os.checklist_teste,
        'checklist_limpeza', os.checklist_limpeza,
        'checklist_fotos', os.checklist_fotos,
        'checklist_assinatura_cliente', os.checklist_assinatura_cliente,
        'supervisao_aprovada', os.supervisao_aprovada,
        'tecnico_nome', os.tecnico_nome
      )
      FROM public.ordens_servico os
      WHERE os.codigo_rastreio = _codigo
    ),
    'relatorios', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', r.id,
          'descricao', r.descricao,
          'fotos', r.fotos,
          'data_relatorio', r.data_relatorio,
          'tecnico_nome', r.tecnico_nome,
          'created_at', r.created_at
        ) ORDER BY r.data_relatorio DESC
      ), '[]'::json)
      FROM public.relatorios_diarios r
      JOIN public.ordens_servico os ON os.id = r.ordem_servico_id
      WHERE os.codigo_rastreio = _codigo
    ),
    'feedbacks', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', f.id,
          'tipo', f.tipo,
          'mensagem', f.mensagem,
          'nota', f.nota,
          'created_at', f.created_at
        ) ORDER BY f.created_at DESC
      ), '[]'::json)
      FROM public.cliente_feedbacks f
      JOIN public.ordens_servico os ON os.id = f.ordem_servico_id
      WHERE os.codigo_rastreio = _codigo
    )
  )
$$;

-- Storage bucket for report photos
INSERT INTO storage.buckets (id, name, public) VALUES ('relatorios-fotos', 'relatorios-fotos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Tecnico can upload photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'relatorios-fotos' AND has_role(auth.uid(), 'tecnico'::app_role));

CREATE POLICY "Anyone can view report photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'relatorios-fotos');
