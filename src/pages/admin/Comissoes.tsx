import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, CheckCircle2 } from "lucide-react";

const moeda = (n: number) => `R$ ${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface Comissao {
  id: string; vendedor_id: string; orcamento_id: string | null; ordem_servico_id: string | null;
  tipo: string; valor: number; status: string; parcela_num: number; parcela_total: number;
  data_prevista: string | null; observacao: string | null; created_at: string;
}

const Comissoes = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<Comissao[]>([]);
  const [vendedores, setVendedores] = useState<Record<string, string>>({});
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [tipoFiltro, setTipoFiltro] = useState("todos");

  const isVendedorOnly = hasRole("vendedor") && !hasRole("admin", "gerente", "financeiro");
  const canManage = hasRole("admin", "gerente", "financeiro");

  const load = async () => {
    let q = supabase.from("vendedor_comissoes" as any).select("*").order("data_prevista", { ascending: true });
    if (isVendedorOnly && user) q = q.eq("vendedor_id", user.id);
    const { data } = await q;
    setList((data ?? []) as any);
    if (!isVendedorOnly) {
      const ids = Array.from(new Set((data ?? []).map((c: any) => c.vendedor_id))) as string[];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("user_id,full_name").in("user_id", ids);
        const map: Record<string, string> = {};
        (profs ?? []).forEach((p: any) => { map[p.user_id] = p.full_name; });
        setVendedores(map);
      }
    }
  };
  useEffect(() => { load(); }, [user]);

  const filtered = useMemo(() => list.filter(c => {
    if (statusFiltro !== "todos" && c.status !== statusFiltro) return false;
    if (tipoFiltro !== "todos" && c.tipo !== tipoFiltro) return false;
    if (busca) {
      const q = busca.toLowerCase();
      const nome = (vendedores[c.vendedor_id] ?? "").toLowerCase();
      if (!nome.includes(q) && !(c.observacao ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [list, statusFiltro, tipoFiltro, busca, vendedores]);

  const totals = useMemo(() => ({
    em_execucao: filtered.filter(c => c.status === "em_execucao").reduce((s, c) => s + Number(c.valor), 0),
    a_receber: filtered.filter(c => c.status === "a_receber").reduce((s, c) => s + Number(c.valor), 0),
    pago: filtered.filter(c => c.status === "pago").reduce((s, c) => s + Number(c.valor), 0),
  }), [filtered]);

  const marcarPago = async (c: Comissao) => {
    const { error } = await supabase.from("vendedor_comissoes" as any).update({ status: "pago" }).eq("id", c.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Comissão marcada como paga" }); load(); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Comissões {isVendedorOnly && "— Minhas"}</h1>
        <p className="text-sm text-slate-500 mt-1">Acompanhamento das etapas: em execução → a receber → pago.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Em execução</p><p className="text-2xl font-bold text-amber-600 mt-1">{moeda(totals.em_execucao)}</p></Card>
        <Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">A receber</p><p className="text-2xl font-bold text-blue-600 mt-1">{moeda(totals.a_receber)}</p></Card>
        <Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Pago</p><p className="text-2xl font-bold text-emerald-600 mt-1">{moeda(totals.pago)}</p></Card>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por vendedor ou observação..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos status</SelectItem>
              <SelectItem value="em_execucao">Em execução</SelectItem>
              <SelectItem value="a_receber">A receber</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos tipos</SelectItem>
              <SelectItem value="avulsa">Avulsa</SelectItem>
              <SelectItem value="recorrente">Recorrente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {!isVendedorOnly && <TableHead>Vendedor</TableHead>}
              <TableHead>Tipo</TableHead>
              <TableHead>Parcela</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Previsto</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={isVendedorOnly ? 6 : 7} className="text-center text-slate-500 py-8">Nenhuma comissão encontrada.</TableCell></TableRow>}
            {filtered.map(c => (
              <TableRow key={c.id}>
                {!isVendedorOnly && <TableCell className="font-medium">{vendedores[c.vendedor_id] ?? c.vendedor_id.slice(0, 8)}</TableCell>}
                <TableCell>{c.tipo === "recorrente" ? "Mensalidade" : "Avulsa"}</TableCell>
                <TableCell>{c.parcela_num}/{c.parcela_total}</TableCell>
                <TableCell className="font-semibold">{moeda(Number(c.valor))}</TableCell>
                <TableCell className="text-sm text-slate-600">{c.data_prevista ? new Date(c.data_prevista).toLocaleDateString("pt-BR") : "—"}</TableCell>
                <TableCell>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    c.status === "pago" ? "bg-emerald-50 text-emerald-700"
                    : c.status === "a_receber" ? "bg-blue-50 text-blue-700"
                    : c.status === "cancelado" ? "bg-slate-100 text-slate-600"
                    : "bg-amber-50 text-amber-700"}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </TableCell>
                {canManage && (
                  <TableCell>
                    {c.status === "a_receber" && (
                      <Button size="sm" onClick={() => marcarPago(c)} className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Pagar
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Comissoes;
