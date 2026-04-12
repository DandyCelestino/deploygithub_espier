import { useState } from "react";
import { Activity, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const actionLabels: Record<string, string> = {
  contrato_fechado: "Contrato Fechado",
  orcamento_aprovado: "Orçamento Aprovado",
  os_status_aberta: "OS Aberta",
  os_status_em_andamento: "OS Em Andamento",
  os_status_aguardando_supervisao: "OS Aguardando Supervisão",
  os_status_concluida: "OS Concluída",
  os_status_encerrada: "OS Encerrada",
  os_status_cancelada: "OS Cancelada",
};

const entityLabels: Record<string, string> = {
  contratos: "Contrato",
  orcamentos: "Orçamento",
  ordens_servico: "Ordem de Serviço",
};

const Logs = () => {
  const [search, setSearch] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activity_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const filtered = logs.filter((l: any) =>
    (actionLabels[l.action] || l.action).toLowerCase().includes(search.toLowerCase()) ||
    (entityLabels[l.entity_type] || l.entity_type).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Logs de Atividade</h1>
        <p className="text-gray-500">Histórico de ações do sistema gerado automaticamente.</p>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input placeholder="Buscar por ação ou entidade..." className="max-w-sm bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-600">Data/Hora</TableHead>
                <TableHead className="text-gray-600">Ação</TableHead>
                <TableHead className="text-gray-600">Entidade</TableHead>
                <TableHead className="text-gray-600">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-gray-500">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-gray-500">Nenhum log encontrado.</TableCell></TableRow>
              ) : filtered.map((l: any) => (
                <TableRow key={l.id} className="border-gray-200">
                  <TableCell className="text-gray-500 text-xs whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                      {actionLabels[l.action] || l.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{entityLabels[l.entity_type] || l.entity_type}</TableCell>
                  <TableCell className="text-gray-500 text-xs max-w-xs truncate">
                    {l.details ? JSON.stringify(l.details) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logs;
