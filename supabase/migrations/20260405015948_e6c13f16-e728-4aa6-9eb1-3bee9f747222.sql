ALTER TABLE public.ordens_servico DROP CONSTRAINT IF EXISTS ordens_servico_status_check;

ALTER TABLE public.ordens_servico ADD CONSTRAINT ordens_servico_status_check
CHECK (status IN ('aberta', 'em_andamento', 'aguardando_supervisao', 'supervisionada', 'concluida', 'cancelada'));