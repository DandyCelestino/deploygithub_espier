import { z } from "zod";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Senha mínima 6 caracteres").max(100),
});

const AdminAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  // Recuperação: após clicar no link do email, o Supabase coloca uma sessão temporária
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
    });
    // Também detecta hash `type=recovery`
    if (window.location.hash.includes("type=recovery")) setRecoveryMode(true);
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: "Verifique os dados", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Falha no login", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
    navigate("/admin", { replace: true });
  };

  const enviarReset = async () => {
    const em = forgotEmail.trim();
    if (!em || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
      toast({ title: "Informe um e-mail válido", variant: "destructive" });
      return;
    }
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(em, {
      redirectTo: `${window.location.origin}/admin/auth`,
    });
    setSendingReset(false);
    if (error) {
      toast({ title: "Não foi possível enviar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "E-mail enviado", description: "Verifique sua caixa de entrada e siga o link de redefinição." });
    setForgotOpen(false);
    setForgotEmail("");
  };

  const salvarNovaSenha = async () => {
    if (newPwd.length < 8) { toast({ title: "Senha mínima 8 caracteres", variant: "destructive" }); return; }
    if (newPwd !== newPwd2) { toast({ title: "Senhas não coincidem", variant: "destructive" }); return; }
    setSavingNew(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setSavingNew(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Senha atualizada!", description: "Você já está conectado." });
    setRecoveryMode(false);
    navigate("/admin", { replace: true });
  };

  if (recoveryMode) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-xl border-slate-200">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center mb-3">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Redefinir senha</h1>
            <p className="text-sm text-slate-500 mt-1 text-center">Defina sua nova senha de acesso.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nova senha</label>
              <Input className="h-11 mt-1.5" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Confirme</label>
              <Input className="h-11 mt-1.5" type="password" value={newPwd2} onChange={(e) => setNewPwd2(e.target.value)} />
            </div>
            <Button onClick={salvarNovaSenha} disabled={savingNew} className="w-full h-11 font-bold">
              {savingNew ? "Salvando..." : "Definir nova senha"}
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-slate-200">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Área Restrita</h1>
          <p className="text-sm text-slate-500 mt-1">Espier.Telecom — ERP Interno</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">E-mail</label>
            <div className="relative mt-1.5">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10 h-11" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Senha</label>
            <div className="relative mt-1.5">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10 h-11" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 font-bold">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <button
            type="button"
            onClick={() => { setForgotEmail(email); setForgotOpen(true); }}
            className="block mx-auto text-xs text-primary hover:underline"
          >
            Esqueci minha senha
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Acesso somente para colaboradores aprovados.
        </p>
      </Card>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
            <DialogDescription>
              Informe seu e-mail cadastrado. Você receberá um link para definir uma nova senha.
            </DialogDescription>
          </DialogHeader>
          <Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="seu@email.com" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>Cancelar</Button>
            <Button onClick={enviarReset} disabled={sendingReset}>{sendingReset ? "Enviando..." : "Enviar link"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AdminAuth;
