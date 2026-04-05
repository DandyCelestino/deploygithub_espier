
-- 1. Make relatorios-fotos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'relatorios-fotos';

-- 2. Drop existing permissive storage policies for this bucket
DROP POLICY IF EXISTS "Anyone can view report photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload report photos" ON storage.objects;

-- 3. Create proper storage policies
CREATE POLICY "Authenticated can view report photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'relatorios-fotos');

CREATE POLICY "Tecnicos can upload report photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'relatorios-fotos' AND has_role(auth.uid(), 'tecnico'::app_role));

CREATE POLICY "Admin/gerente can delete report photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'relatorios-fotos' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role)));

-- 4. Restrict configuracoes SELECT to admin/gerente only
DROP POLICY IF EXISTS "All authenticated can view configuracoes" ON public.configuracoes;
CREATE POLICY "Admin/gerente can view configuracoes"
ON public.configuracoes FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role));

-- 5. Increase tracking code entropy (16 hex chars = 64 bits)
ALTER TABLE public.ordens_servico
ALTER COLUMN codigo_rastreio SET DEFAULT encode(gen_random_bytes(8), 'hex');
