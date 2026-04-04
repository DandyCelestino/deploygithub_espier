import { useState } from "react";
import { Search, Clock, CheckCircle, ClipboardCheck, Camera, Star, MessageSquare, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  aberta: "Aberta",
  em_andamento: "Em Andamento",
  aguardando_supervisao: "Aguardando Vistoria",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const statusColors: Record<string, string> = {
  aberta: "bg-blue-100 text-blue-700",
  em_andamento: "bg-yellow-100 text-yellow-700",
  aguardando_supervisao: "bg-purple-100 text-purple-700",
  concluida: "bg-green-100 text-green-700",
  cancelada: "bg-red-100 text-red-700",
};

const checklistLabels = [
  { key: "checklist_materiais", label: "Materiais instalados" },
  { key: "checklist_instalacao", label: "Instalação concluída" },
  { key: "checklist_teste", label: "Testes realizados" },
  { key: "checklist_limpeza", label: "Limpeza do local" },
  { key: "checklist_fotos", label: "Fotos registradas" },
  { key: "checklist_assinatura_cliente", label: "Assinatura do cliente" },
];

interface OSData {
  ordem: any;
  relatorios: any[];
  feedbacks: any[];
}

const AcompanharOS = () => {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OSData | null>(null);
  const [feedbackTipo, setFeedbackTipo] = useState("satisfacao");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackNota, setFeedbackNota] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [codigoUsado, setCodigoUsado] = useState("");

  const buscar = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc("get_os_by_tracking_code", { _codigo: codigo.trim() });
      if (error) throw error;
      if (!result || !result.ordem) {
        toast.error("Código não encontrado.");
        setData(null);
      } else {
        setData(result as OSData);
        setCodigoUsado(codigo.trim());
      }
    } catch {
      toast.error("Erro ao buscar ordem.");
    } finally {
      setLoading(false);
    }
  };

  const enviarFeedback = async () => {
    if (!data?.ordem?.id || !codigoUsado) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("cliente_feedbacks").insert({
        ordem_servico_id: data.ordem.id,
        codigo_rastreio: codigoUsado,
        tipo: feedbackTipo,
        mensagem: feedbackMsg,
        nota: feedbackNota,
      });
      if (error) throw error;
      toast.success("Feedback enviado com sucesso!");
      setFeedbackMsg("");
      // Refresh data
      buscar();
    } catch {
      toast.error("Erro ao enviar feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const ordem = data?.ordem;
  const relatorios = data?.relatorios || [];
  const feedbacks = data?.feedbacks || [];
  const checklistCount = ordem ? checklistLabels.filter((c) => ordem[c.key]).length : 0;
  const isFinished = ordem?.status === "concluida" || ordem?.status === "aguardando_supervisao";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-gray-900">
              Espier.<span className="text-primary">Telecom</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Acompanhe sua Ordem de Serviço</h1>
          <p className="text-sm text-gray-500">Digite o código de rastreio fornecido pela empresa</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o código de rastreio..."
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
              />
              <Button onClick={buscar} disabled={loading} className="gap-2">
                <Search className="h-4 w-4" />
                {loading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {ordem && (
          <>
            {/* OS Info */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">Detalhes do Serviço</CardTitle>
                  <Badge className={statusColors[ordem.status] || "bg-gray-100 text-gray-700"}>
                    {statusLabels[ordem.status] || ordem.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <p className="text-gray-600"><strong className="text-gray-900">Cliente:</strong> {ordem.cliente_nome}</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Serviço:</strong> {ordem.servico_solicitado}</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Técnico:</strong> {ordem.tecnico_nome || "Ainda não atribuído"}</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Criação:</strong> {new Date(ordem.created_at).toLocaleDateString("pt-BR")}</p>
                  <p className="text-gray-600"><strong className="text-gray-900">Prazo:</strong> {ordem.prazo_termino ? new Date(ordem.prazo_termino + "T00:00:00").toLocaleDateString("pt-BR") : "A definir"}</p>
                  {ordem.data_conclusao && (
                    <p className="text-gray-600"><strong className="text-gray-900">Concluída em:</strong> {new Date(ordem.data_conclusao).toLocaleDateString("pt-BR")}</p>
                  )}
                </div>

                {/* Progress */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Progresso da Execução</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {checklistLabels.map((c) => (
                      <div key={c.key} className={`flex items-center gap-2 p-2 rounded text-xs ${ordem[c.key] ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"}`}>
                        {ordem[c.key] ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {c.label}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{checklistCount}/6 etapas concluídas</p>
                </div>

                {/* Supervision status */}
                {ordem.status === "aguardando_supervisao" && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-700 flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4" />
                      O técnico finalizou a instalação e solicitou vistoria. Aguardando aprovação do supervisor.
                    </p>
                  </div>
                )}

                {ordem.supervisao_aprovada && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Vistoria realizada e aprovada! Serviço concluído com sucesso.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Reports */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-500" />
                  Relatórios Diários do Técnico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {relatorios.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Nenhum relatório registrado ainda.</p>
                ) : (
                  <div className="space-y-4">
                    {relatorios.map((r: any) => (
                      <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(r.data_relatorio + "T00:00:00").toLocaleDateString("pt-BR")}
                          </span>
                          <span className="text-xs text-gray-500">por {r.tecnico_nome || "Técnico"}</span>
                        </div>
                        <p className="text-sm text-gray-700">{r.descricao}</p>
                        {r.fotos && r.fotos.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto">
                            {r.fotos.map((foto: string, i: number) => (
                              <img key={i} src={foto} alt={`Foto ${i + 1}`} className="h-20 w-20 object-cover rounded border border-gray-200" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback Area - only after OS is finished */}
            {isFinished && (
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    Sua Avaliação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Previous feedbacks */}
                  {feedbacks.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {feedbacks.map((f: any) => (
                        <div key={f.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={f.tipo === "elogio" ? "bg-green-100 text-green-700" : f.tipo === "reclamacao" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}>
                              {f.tipo === "elogio" ? "Elogio" : f.tipo === "reclamacao" ? "Reclamação" : "Satisfação"}
                            </Badge>
                            {f.nota && (
                              <span className="flex items-center gap-1 text-yellow-500">
                                {Array.from({ length: f.nota }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-current" />
                                ))}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600">{f.mensagem}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New feedback form */}
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">Enviar Avaliação</h4>
                    <div>
                      <Label className="text-gray-600 text-sm">Tipo</Label>
                      <div className="flex gap-2 mt-1">
                        {[
                          { value: "satisfacao", label: "Satisfação", color: "bg-blue-100 text-blue-700 border-blue-300" },
                          { value: "elogio", label: "Elogio", color: "bg-green-100 text-green-700 border-green-300" },
                          { value: "reclamacao", label: "Reclamação", color: "bg-red-100 text-red-700 border-red-300" },
                        ].map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setFeedbackTipo(t.value)}
                            className={`px-3 py-1 rounded-full text-xs border ${feedbackTipo === t.value ? t.color + " font-bold" : "bg-white text-gray-500 border-gray-300"}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600 text-sm">Nota</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} onClick={() => setFeedbackNota(n)}>
                            <Star className={`h-6 w-6 ${n <= feedbackNota ? "text-yellow-500 fill-current" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600 text-sm">Mensagem</Label>
                      <Textarea
                        className="bg-white border-gray-300 text-gray-900"
                        value={feedbackMsg}
                        onChange={(e) => setFeedbackMsg(e.target.value)}
                        placeholder="Conte-nos sobre sua experiência..."
                      />
                    </div>
                    <Button onClick={enviarFeedback} disabled={submitting || !feedbackMsg.trim()} className="w-full">
                      {submitting ? "Enviando..." : "Enviar Avaliação"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AcompanharOS;
