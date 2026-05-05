import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Conf { id: string; chave: string; valor: string | null; descricao: string | null; }

const Configuracoes = () => {
  const { toast } = useToast();
  const [list, setList] = useState<Conf[]>([]);

  const load = async () => {
    const { data } = await supabase.from("configuracoes").select("*").order("chave");
    setList((data ?? []) as Conf[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (c: Conf) => {
    const { error } = await supabase.from("configuracoes").update({ valor: c.valor }).eq("id", c.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Salvo" });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500 mt-1">Parâmetros gerais do sistema.</p>
      </div>
      <Card className="p-6 space-y-4">
        {list.length === 0 && <p className="text-slate-500 text-sm">Nenhuma configuração cadastrada ainda.</p>}
        {list.map(c => (
          <div key={c.id}>
            <label className="text-xs font-bold uppercase text-slate-600">{c.chave}</label>
            {c.descricao && <p className="text-xs text-slate-400 mb-1">{c.descricao}</p>}
            <div className="flex gap-2">
              <Input value={c.valor ?? ""} onChange={e => setList(prev => prev.map(x => x.id === c.id ? { ...x, valor: e.target.value } : x))} />
              <Button onClick={() => save(c)}>Salvar</Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default Configuracoes;
