import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { CheckCircle2, XCircle, Clock, Eye, Copy } from "lucide-react";

interface Candidatura {
  id: string; nome_completo: string; email: string; telefone: string;
  cpf: string; endereco: string; cargo_desejado: string; experiencia: string;
  disponibilidade: string; curriculo_url: string | null; mensagem: string | null;
  status: string; created_at: string; user_id_criado: string | null;
}

const statusBadge = (s: string) => {
  if (s === "pendente") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "aprovado") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
};

const Candidaturas = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<Candidatura[]>([]);
  const [filtro, setFiltro] = useState<"todos" | "pendente" | "aprovado" | "rejeitado">("pendente");
  const [busca, setBusca] = useState("");
  const [selected, setSelected] = useState<Candidatura | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [role, setRole] = useState<AppRole>("tecnico");
  const [senha, setSenha] = useState("");
  const [motivo, setMotivo] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ email: string; senha: string } | null>(null);

  const load = async () => {
    let q = supabase.from("candidaturas").select("*").order("created_at", { ascending: false });
    if (filtro !== "todos") q = q.eq("status", filtro);
    const { data } = await q;
    setList((data ?? []) as Candidatura[]);
  };

  useEffect(() => { load(); }, [filtro]);

  const filtered = list.filter(c =>
    !busca || c.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
    c.email.toLowerCase().includes(busca.toLowerCase())
  );

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
    let p = "";
    for (let i = 0; i < 12; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setSenha(p);
  };

  const openApprove = (c: Candidatura) => {
    setSelected(c); setRole("tecnico"); setSenha(""); setApproveOpen(true);
  };

  const handleApprove = async () => {
    if (!selected) return;
    if (senha.length < 8) {
      toast({ title: "Senha curta", description: "Mínimo 8 caracteres.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-create-user", {
      body: { candidatura_id: selected.id, role, senha_temporaria: senha },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast({ title: "Erro ao aprovar", description: (data as any)?.error || error?.message, variant: "destructive" });
      return;
    }
    setApproveOpen(false);
    setCreatedInfo({ email: selected.email, senha });
    toast({ title: "Aprovado!", description: "Usuário criado com sucesso." });
    load();
  };

  const handleReject = async () => {
    if (!selected) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-reject-candidatura", {
      body: { candidatura_id: selected.id, motivo },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast({ title: "Erro", description: (data as any)?.error || error?.message, variant: "destructive" });
      return;
    }
    setRejectOpen(false); setMotivo("");
    toast({ title: "Rejeitada", description: "Candidatura marcada como rejeitada." });
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Candidaturas</h1>
        <p className="text-sm text-slate-500 mt-1">Avalie cadastros recebidos pelo formulário "Trabalhe Conosco".</p>
      </div>

      <Card className="p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <Input placeholder="Buscar por nome ou e-mail..." value={busca} onChange={e => setBusca(e.target.value)} className="sm:max-w-md" />
        <Select value={filtro} onValueChange={(v: any) => setFiltro(v)}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="aprovado">Aprovadas</SelectItem>
            <SelectItem value="rejeitado">Rejeitadas</SelectItem>
            <SelectItem value="todos">Todas</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-slate-500">Nenhuma candidatura encontrada.</Card>
        )}
        {filtered.map(c => (
          <Card key={c.id} className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900">{c.nome_completo}</h3>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${statusBadge(c.status)}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{c.email} · {c.telefone}</p>
                <p className="text-sm text-slate-700 mt-2">
                  <strong>Cargo:</strong> {c.cargo_desejado} · <strong>Disponibilidade:</strong> {c.disponibilidade}
                </p>
                <p className="text-xs text-slate-400 mt-1">{new Date(c.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setSelected(c)}>
                  <Eye className="w-4 h-4 mr-1.5" /> Detalhes
                </Button>
                {c.status === "pendente" && (
                  <>
                    <Button size="sm" onClick={() => openApprove(c)} className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Aprovar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => { setSelected(c); setRejectOpen(true); }}>
                      <XCircle className="w-4 h-4 mr-1.5" /> Rejeitar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detalhes */}
      <Dialog open={!!selected && !approveOpen && !rejectOpen && !createdInfo} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.nome_completo}</DialogTitle>
                <DialogDescription>{selected.cargo_desejado}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <Field label="E-mail" v={selected.email} />
                <Field label="Telefone" v={selected.telefone} />
                <Field label="CPF" v={selected.cpf} />
                <Field label="Endereço" v={selected.endereco} />
                <Field label="Disponibilidade" v={selected.disponibilidade} />
                <Field label="Experiência" v={selected.experiencia} />
                {selected.curriculo_url && (
                  <Field label="Currículo" v={<a href={selected.curriculo_url} target="_blank" rel="noreferrer" className="text-primary underline">{selected.curriculo_url}</a>} />
                )}
                {selected.mensagem && <Field label="Mensagem" v={selected.mensagem} />}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Aprovar */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar candidatura</DialogTitle>
            <DialogDescription>
              Será criado o acesso de <strong>{selected?.email}</strong> com a role e senha definidas abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Role</label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  {isAdmin && <SelectItem value="gerente">Gerente</SelectItem>}
                  {isAdmin && <SelectItem value="admin">Administrador</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Senha temporária</label>
              <div className="flex gap-2 mt-1.5">
                <Input value={senha} onChange={e => setSenha(e.target.value)} placeholder="mín. 8 caracteres" />
                <Button type="button" variant="outline" onClick={generatePassword}>Gerar</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancelar</Button>
            <Button onClick={handleApprove} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700">
              {busy ? "Criando..." : "Aprovar e criar acesso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejeitar */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar candidatura</DialogTitle>
            <DialogDescription>Motivo (opcional, registrado internamente):</DialogDescription>
          </DialogHeader>
          <Textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} maxLength={500} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReject} disabled={busy}>{busy ? "..." : "Confirmar rejeição"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Senha gerada */}
      <Dialog open={!!createdInfo} onOpenChange={(o) => !o && setCreatedInfo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-emerald-700">Acesso criado!</DialogTitle>
            <DialogDescription>
              Anote ou envie estas credenciais ao colaborador. Esta tela <strong>não será exibida novamente</strong>.
            </DialogDescription>
          </DialogHeader>
          {createdInfo && (
            <div className="space-y-3">
              <CopyRow label="E-mail" value={createdInfo.email} />
              <CopyRow label="Senha temporária" value={createdInfo.senha} />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCreatedInfo(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ label, v }: { label: string; v: React.ReactNode }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="text-sm text-slate-800 mt-0.5 whitespace-pre-wrap break-words">{v}</p>
  </div>
);

const CopyRow = ({ label, value }: { label: string; value: string }) => {
  const { toast } = useToast();
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <div className="flex gap-2">
        <Input value={value} readOnly className="font-mono" />
        <Button variant="outline" size="icon" onClick={() => {
          navigator.clipboard.writeText(value);
          toast({ title: "Copiado!" });
        }}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Candidaturas;
