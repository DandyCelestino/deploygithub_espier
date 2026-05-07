import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { History, Search } from "lucide-react";

interface Log {
  id: string; user_id: string | null; action: string; entity_type: string;
  entity_id: string | null; details: any; created_at: string;
}

const Historico = () => {
  const [list, setList] = useState<Log[]>([]);
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(500);
      setList((data ?? []) as Log[]);
      const userIds = [...new Set((data ?? []).map((l: any) => l.user_id).filter(Boolean))];
      if (userIds.length) {
        const { data: profs } = await supabase.from("profiles").select("user_id,full_name,email").in("user_id", userIds);
        const map: Record<string, string> = {};
        (profs ?? []).forEach((p: any) => { map[p.user_id] = p.full_name || p.email; });
        setProfiles(map);
      }
    })();
  }, []);

  const tipos = [...new Set(list.map(l => l.entity_type))];
  const filtered = list.filter(l =>
    (tipo === "todos" || l.entity_type === tipo) &&
    (!busca || l.action.toLowerCase().includes(busca.toLowerCase()) || (profiles[l.user_id ?? ""] ?? "").toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <History className="w-7 h-7 text-primary" /> Histórico de ações
        </h1>
        <p className="text-sm text-slate-500 mt-1">Auditoria completa de eventos do sistema (últimas 500).</p>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por ação ou usuário..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" />
          </div>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as entidades</SelectItem>
              {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quando</TableHead><TableHead>Usuário</TableHead><TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead><TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-8">Nenhum registro.</TableCell></TableRow>}
            {filtered.map(l => (
              <TableRow key={l.id}>
                <TableCell className="text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString("pt-BR")}</TableCell>
                <TableCell className="text-sm">{profiles[l.user_id ?? ""] ?? "—"}</TableCell>
                <TableCell><span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{l.action}</span></TableCell>
                <TableCell className="text-xs text-slate-500">{l.entity_type}</TableCell>
                <TableCell className="text-xs text-slate-500 max-w-md truncate">
                  {l.details && Object.keys(l.details).length ? JSON.stringify(l.details) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Historico;
