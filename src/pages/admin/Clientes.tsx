import { useState } from "react";
import { Users, Plus, Search, Eye, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Clientes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", document: "" });

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editItem) {
        const { error } = await supabase.from("clientes").update(form).eq("id", editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clientes").insert({ ...form, created_by: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success(editItem ? "Cliente atualizado!" : "Cliente cadastrado!");
      setOpen(false);
      setEditItem(null);
      setForm({ name: "", email: "", phone: "", document: "" });
    },
    onError: () => toast.error("Erro ao salvar cliente"),
  });

  const openEdit = (c: any) => {
    setForm({ name: c.name, email: c.email || "", phone: c.phone || "", document: c.document || "" });
    setEditItem(c);
    setOpen(true);
  };

  const openNew = () => {
    setForm({ name: "", email: "", phone: "", document: "" });
    setEditItem(null);
    setOpen(true);
  };

  const filtered = clientes.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.document || "").includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">Gerencie seus clientes.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openNew}><Plus className="h-4 w-4" /> Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">{editItem ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label className="text-gray-600">Nome *</Label><Input className="bg-white border-gray-300 text-gray-900" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="text-gray-600">E-mail</Label><Input className="bg-white border-gray-300 text-gray-900" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label className="text-gray-600">Telefone</Label><Input className="bg-white border-gray-300 text-gray-900" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label className="text-gray-600">Documento (CPF/CNPJ)</Label><Input className="bg-white border-gray-300 text-gray-900" value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} /></div>
              <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : editItem ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input placeholder="Buscar por nome, e-mail ou documento..." className="max-w-sm bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-600">Nome</TableHead>
                <TableHead className="text-gray-600">E-mail</TableHead>
                <TableHead className="text-gray-600">Telefone</TableHead>
                <TableHead className="text-gray-600">Documento</TableHead>
                <TableHead className="text-gray-600">Cadastro</TableHead>
                <TableHead className="text-gray-600">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500">Nenhum cliente encontrado.</TableCell></TableRow>
              ) : filtered.map((c: any) => (
                <TableRow key={c.id} className="border-gray-200">
                  <TableCell className="text-gray-900 font-medium">{c.name}</TableCell>
                  <TableCell className="text-gray-600">{c.email || "-"}</TableCell>
                  <TableCell className="text-gray-600">{c.phone || "-"}</TableCell>
                  <TableCell className="text-gray-600">{c.document || "-"}</TableCell>
                  <TableCell className="text-gray-500 text-xs">{new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4 text-gray-500" /></Button>
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

export default Clientes;
