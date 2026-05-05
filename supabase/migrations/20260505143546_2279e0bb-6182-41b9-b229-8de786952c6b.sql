DO $$ BEGIN
  -- updated_at triggers
  DROP TRIGGER IF EXISTS update_candidaturas_updated_at ON public.candidaturas;
  CREATE TRIGGER update_candidaturas_updated_at BEFORE UPDATE ON public.candidaturas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_clientes_updated_at ON public.clientes;
  CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_contratos_updated_at ON public.contratos;
  CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON public.contratos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_ordens_servico_updated_at ON public.ordens_servico;
  CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_estoque_itens_updated_at ON public.estoque_itens;
  CREATE TRIGGER update_estoque_itens_updated_at BEFORE UPDATE ON public.estoque_itens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_financeiro_contas_updated_at ON public.financeiro_contas;
  CREATE TRIGGER update_financeiro_contas_updated_at BEFORE UPDATE ON public.financeiro_contas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
  CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_configuracoes_updated_at ON public.configuracoes;
  CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON public.configuracoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  -- business triggers
  DROP TRIGGER IF EXISTS on_orcamento_aprovado_trigger ON public.orcamentos;
  CREATE TRIGGER on_orcamento_aprovado_trigger AFTER UPDATE ON public.orcamentos FOR EACH ROW EXECUTE FUNCTION public.on_orcamento_aprovado();

  DROP TRIGGER IF EXISTS on_contrato_fechado_trigger ON public.contratos;
  CREATE TRIGGER on_contrato_fechado_trigger AFTER UPDATE ON public.contratos FOR EACH ROW EXECUTE FUNCTION public.on_contrato_fechado();

  DROP TRIGGER IF EXISTS on_os_status_change_trigger ON public.ordens_servico;
  CREATE TRIGGER on_os_status_change_trigger AFTER UPDATE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION public.on_os_status_change();
END $$;

ALTER TABLE public.candidaturas ADD COLUMN IF NOT EXISTS user_id_criado uuid;