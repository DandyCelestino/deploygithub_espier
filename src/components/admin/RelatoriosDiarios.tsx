import { useState, useEffect } from "react";
import { Camera, Send, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const useSignedUrl = (path: string | null) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!path) return;
    // If it's already a full URL (legacy data), use as-is
    if (path.startsWith("http")) { setUrl(path); return; }
    supabase.storage.from("relatorios-fotos").createSignedUrl(path, 3600)
      .then(({ data }) => { if (data) setUrl(data.signedUrl); });
  }, [path]);
  return url;
};

const SignedImage = ({ path, alt }: { path: string; alt: string }) => {
  const url = useSignedUrl(path);
  if (!url) return <div className="h-20 w-20 bg-gray-100 rounded animate-pulse" />;
  return <img src={url} alt={alt} className="h-20 w-20 object-cover rounded border border-gray-200" />;
};

const RelatoriosDiarios = () => {
  const { user, profile, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const isTecnico = hasRole("tecnico");
  const isGerente = hasRole("gerente") || hasRole("admin");
  const [descricao, setDescricao] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Get active OS for technician
  const { data: activeOS } = useQuery({
    queryKey: ["active_os_for_report", user?.id],
    queryFn: async () => {
      if (!isTecnico) return null;
      const { data } = await supabase
        .from("ordens_servico")
        .select("id, cliente_nome, servico_solicitado, codigo_rastreio")
        .eq("tecnico_id", user!.id)
        .in("status", ["em_andamento", "aguardando_supervisao"])
        .limit(1)
        .single();
      return data;
    },
    enabled: isTecnico,
  });

  // Get all reports (filtered by role)
  const { data: relatorios = [] } = useQuery({
    queryKey: ["relatorios_diarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relatorios_diarios")
        .select("*, ordens_servico:ordem_servico_id(cliente_nome, servico_solicitado)")
        .order("data_relatorio", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!activeOS) throw new Error("Sem OS ativa");
      setUploading(true);
      
      // Upload photos - store file paths (bucket is private, use signed URLs to view)
      const fotoPaths: string[] = [];
      for (const foto of fotos) {
        const fileName = `${activeOS.id}/${Date.now()}_${foto.name}`;
        const { error: uploadError } = await supabase.storage
          .from("relatorios-fotos")
          .upload(fileName, foto);
        if (uploadError) throw uploadError;
        fotoPaths.push(fileName);
      }

      const { error } = await supabase.from("relatorios_diarios").insert({
        ordem_servico_id: activeOS.id,
        tecnico_id: user!.id,
        tecnico_nome: profile?.full_name || "",
        descricao,
        fotos: fotoPaths,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relatorios_diarios"] });
      setDescricao("");
      setFotos([]);
      setUploading(false);
      toast.success("Relatório enviado!");
    },
    onError: () => {
      setUploading(false);
      toast.error("Erro ao enviar relatório");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios Diários</h1>
        <p className="text-gray-500">Relatórios de progresso das ordens de serviço.</p>
      </div>

      {/* Technician: submit report */}
      {isTecnico && activeOS && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-500" />
              Enviar Relatório - {activeOS.cliente_nome}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">OS: {activeOS.servico_solicitado} | Código: <strong>{activeOS.codigo_rastreio}</strong></p>
            <div>
              <Label className="text-gray-700">Descrição do que foi realizado hoje</Label>
              <Textarea
                className="bg-white border-gray-300 text-gray-900"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva as atividades realizadas hoje..."
                rows={4}
              />
            </div>
            <div>
              <Label className="text-gray-700">Fotos (opcional)</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFotos(Array.from(e.target.files || []))}
                className="mt-1 text-sm text-gray-600"
              />
              {fotos.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{fotos.length} foto(s) selecionada(s)</p>
              )}
            </div>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={!descricao.trim() || uploading || submitMutation.isPending}
              className="w-full gap-2"
            >
              <Camera className="h-4 w-4" />
              {uploading ? "Enviando fotos..." : submitMutation.isPending ? "Enviando..." : "Enviar Relatório"}
            </Button>
          </CardContent>
        </Card>
      )}

      {isTecnico && !activeOS && (
        <Card className="bg-white border-gray-200">
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Você não possui uma ordem ativa. Aceite uma OS para enviar relatórios.</p>
          </CardContent>
        </Card>
      )}

      {/* All reports list */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Histórico de Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          {relatorios.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Nenhum relatório encontrado.</p>
          ) : (
            <div className="space-y-4">
              {relatorios.map((r: any) => (
                <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(r.data_relatorio + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">por {r.tecnico_nome || "Técnico"}</span>
                    </div>
                    {r.ordens_servico && (
                      <span className="text-xs text-gray-500">{(r.ordens_servico as any).cliente_nome}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{r.descricao}</p>
                  {r.fotos && r.fotos.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {r.fotos.map((foto: string, i: number) => (
                        <SignedImage key={i} path={foto} alt={`Foto ${i + 1}`} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosDiarios;
