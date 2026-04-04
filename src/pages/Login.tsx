import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: "Erro ao entrar",
        description: error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message,
        variant: "destructive",
      });
    } else {
      navigate("/admin");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-gray-200 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <Shield className="w-12 h-12 text-primary mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">
            Espier.<span className="text-primary">Telecom</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Área Restrita</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">E-mail</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn className="w-4 h-4 mr-2" />
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-primary transition-colors">
            ← Voltar ao site
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
