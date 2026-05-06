import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Package, CheckCircle2, Clock, Camera, FileText, ArrowLeft } from "lucide-react";

interface OS {
  id: string;
  cliente_nome: string;
  servico_solicitado: string;
  status: string;
  created_at: string;
  prazo_termino: string | null;
  data_inicio: string | null;
  data_conclusao: string | null;
  checklist_materiais: boolean;
  checklist_instalacao: boolean;
  checklist_teste: boolean;
  checklist_limpeza: boolean;
  checklist_fotos: boolean;
  checklist_assinatura_cliente: boolean;
  supervisao_aprovada: boolean;
  tecnico_nome: string | null;
}
interface Relatorio {
  id: string;
  descricao: string;
  fotos: string[] | null;
  data_relatorio: string;
  tecnico_nome: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  aberta: { label: "Aberta", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  em_andamento: { label: "Em execução", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  aguardando_supervisao: { label: "Aguardando vistoria", cls: "bg-purple-100 text-purple-800 border-purple-200" },
  concluida: { label: "Concluída", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelada: { label: "Cancelada", cls: "bg-rose-100 text-rose-800 border-rose-200" },
};

const Rastreio = () => {
  const [params, setParams] = useSearchParams();
  const codigoQs = params.get("codigo") ?? "";
  const [codigo, setCodigo] = useState(codigoQs);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<OS | null>(null);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);

  const buscar = async (c: string) => {
    if (!c.trim()) return;
    setLoading(true);
    setErro(null);
    setOrdem(null);
    setRelatorios([]);
    const { data, error } = await supabase.rpc("get_os_by_tracking_code", { _codigo: c.trim() });
    setLoading(false);
    if (error) {
      setErro("Não foi possível consultar agora. Tente novamente.");
      return;
    }
    const payload: any = data;
    if (!payload?.ordem) {
      setErro("Código não encontrado. Verifique e tente novamente.");
      return;
    }
    setOrdem(payload.ordem);
    setRelatorios(payload.relatorios ?? []);
  };

  useEffect(() => {
    if (codigoQs) buscar(codigoQs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigoQs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ codigo: codigo.trim() });
  };

  const checklist = ordem
    ? [
        ["Materiais conferidos", ordem.checklist_materiais],
        ["Instalação concluída", ordem.checklist_instalacao],
        ["Testes realizados", ordem.checklist_teste],
        ["Limpeza", ordem.checklist_limpeza],
        ["Fotos enviadas", ordem.checklist_fotos],
        ["Assinatura do cliente", ordem.checklist_assinatura_cliente],
      ]
    : [];

  const st = ordem ? STATUS_LABEL[ordem.status] ?? { label: ordem.status, cls: "bg-slate-100 text-slate-800 border-slate-200" } : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 lg:pt-28 pb-16">
        <div className="section-container">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-primary transition mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar ao site
          </Link>

          <div className="max-w-3xl">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-primary mb-2">Rastreamento de OS</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Acompanhe sua Ordem de Serviço</h1>
            <p className="text-foreground/60 mt-2">Use o código informado pela equipe Espier para ver status, checklist e relatórios diários.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 max-w-xl flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Código de rastreamento"
                className="w-full h-12 pl-10 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:border-primary transition"
              />
            </div>
            <button type="submit" className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition">
              Consultar
            </button>
          </form>

          {loading && <p className="mt-8 text-sm text-foreground/60">Consultando...</p>}
          {erro && <p className="mt-8 text-sm text-rose-600 font-medium">{erro}</p>}

          {ordem && st && (
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {/* Resumo */}
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-foreground/50">Cliente</p>
                    <p className="text-lg font-bold text-foreground">{ordem.cliente_nome}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${st.cls}`}>{st.label}</span>
                </div>

                <div className="space-y-2 mb-5">
                  <p className="text-xs uppercase tracking-wider text-foreground/50">Serviço</p>
                  <p className="text-sm text-foreground/85">{ordem.servico_solicitado}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-foreground/50">Aberta em</p>
                    <p className="text-foreground/85">{new Date(ordem.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  {ordem.data_inicio && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-foreground/50">Início</p>
                      <p className="text-foreground/85">{new Date(ordem.data_inicio).toLocaleDateString("pt-BR")}</p>
                    </div>
                  )}
                  {ordem.tecnico_nome && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-foreground/50">Técnico</p>
                      <p className="text-foreground/85">{ordem.tecnico_nome}</p>
                    </div>
                  )}
                  {ordem.data_conclusao && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-foreground/50">Conclusão</p>
                      <p className="text-foreground/85">{new Date(ordem.data_conclusao).toLocaleDateString("pt-BR")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Checklist */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-3 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Checklist do serviço
                </p>
                <ul className="space-y-2">
                  {checklist.map(([label, ok]) => (
                    <li key={label as string} className="flex items-center gap-2 text-sm">
                      {ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-foreground/30" />
                      )}
                      <span className={ok ? "text-foreground/85" : "text-foreground/50"}>{label as string}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Relatórios */}
              <div className="lg:col-span-3">
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" /> Relatórios diários
                </h2>
                {relatorios.length === 0 ? (
                  <p className="text-sm text-foreground/50">Nenhum relatório enviado ainda.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {relatorios.map((r) => (
                      <div key={r.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-primary">
                            {new Date(r.data_relatorio).toLocaleDateString("pt-BR")}
                          </p>
                          {r.tecnico_nome && <span className="text-xs text-foreground/50">por {r.tecnico_nome}</span>}
                        </div>
                        <p className="text-sm text-foreground/85 whitespace-pre-line">{r.descricao}</p>
                        {r.fotos && r.fotos.length > 0 && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {r.fotos.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden rounded-lg border border-border hover:opacity-90 transition">
                                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                              </a>
                            ))}
                          </div>
                        )}
                        {(!r.fotos || r.fotos.length === 0) && (
                          <p className="mt-3 text-xs text-foreground/40 flex items-center gap-1"><Camera className="w-3.5 h-3.5" /> Sem fotos</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Rastreio;
