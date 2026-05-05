-- Tabela de candidaturas (Trabalhe Conosco)
CREATE TABLE public.candidaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo text NOT NULL,
  email text NOT NULL,
  telefone text NOT NULL,
  cpf text NOT NULL,
  endereco text NOT NULL,
  cargo_desejado text NOT NULL,
  experiencia text NOT NULL,
  disponibilidade text NOT NULL,
  curriculo_url text,
  mensagem text,
  status text NOT NULL DEFAULT 'pendente',
  observacoes_internas text,
  avaliado_por uuid,
  avaliado_em timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.candidaturas ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode enviar candidatura (formulário público)
CREATE POLICY "Anyone can submit candidatura"
ON public.candidaturas
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admin e gerente podem visualizar todas
CREATE POLICY "Admin/gerente can view candidaturas"
ON public.candidaturas
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role));

-- Admin e gerente podem atualizar (mudar status)
CREATE POLICY "Admin/gerente can update candidaturas"
ON public.candidaturas
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role));

-- Admin pode excluir
CREATE POLICY "Admin can delete candidaturas"
ON public.candidaturas
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger updated_at
CREATE TRIGGER trg_candidaturas_updated_at
BEFORE UPDATE ON public.candidaturas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index para listar por status/data
CREATE INDEX idx_candidaturas_status_created ON public.candidaturas (status, created_at DESC);