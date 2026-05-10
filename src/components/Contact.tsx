import { useState } from "react";
import { Phone, Mail, MapPin, Send, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", mensagem: "" });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    // Cria orçamento na área restrita (origem = site, status = pendente)
    const { error } = await supabase.from("orcamentos").insert({
      cliente_nome: form.nome,
      cliente_email: form.email || null,
      cliente_telefone: form.telefone || null,
      endereco: "", cidade: "", estado: "RJ",
      servico_solicitado: "Solicitação via site",
      descricao: form.mensagem,
      valor_total: 0, valor_instalacao: 0,
      status: "pendente",
      origem: "site",
    } as any);
    setBusy(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pedido recebido!", description: "Sua solicitação foi registrada e nossa equipe entrará em contato em até 24h úteis." });
    setForm({ nome: "", email: "", telefone: "", mensagem: "" });
  };

  const inputCls = "bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12";

  return (
    <section id="contato" className="py-20 lg:py-32 section-dark-alt">
      <div className="section-container relative">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="eyebrow eyebrow-line">Contato</span>
          <h2 className="h-section mt-5">
            Fale <span className="gradient-text">conosco</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Solicite um orçamento sem compromisso ou tire suas dúvidas. Resposta em até 24h úteis.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <form onSubmit={handleSubmit} className="premium-card p-7 sm:p-8 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2">Nome completo</label>
              <Input
                placeholder="Seu nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
                className={inputCls}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2">E-mail</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2">Telefone</label>
                <Input
                  placeholder="(21) 9 0000-0000"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2">Mensagem</label>
              <Textarea
                placeholder="Conte-nos sua necessidade..."
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                required
                rows={5}
                className={inputCls + " h-auto resize-none"}
              />
            </div>
            <Button type="submit" size="lg" disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-red font-bold uppercase tracking-wide">
              <Send className="w-4 h-4 mr-2" /> {busy ? "Enviando..." : "Solicitar Orçamento"}
            </Button>
          </form>

          <div className="space-y-4">
            {[
              { icon: MessageCircle, title: "WhatsApp", info: "(21) 96000-1439", href: "https://wa.me/5521960001439", external: true, accent: "primary" },
              { icon: Phone, title: "Telefone", info: "(21) 96000-1439", href: "tel:+5521960001439", accent: "primary" },
              { icon: Mail, title: "E-mail", info: "espier.telecom@gmail.com", href: "mailto:espier.telecom@gmail.com", accent: "primary" },
              { icon: MapPin, title: "Atendemos", info: "RJ — Região Serrana, dos Lagos, Grande Rio e Costa Verde", accent: "primary" },
              { icon: Clock, title: "Horário", info: "Seg a Sex 8h–18h · Suporte 24/7 para contratos", accent: "accent" },
            ].map((item) => {
              const inner = (
                <div className="flex items-start gap-4 group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
                    item.accent === "accent"
                      ? "bg-accent/10 border-accent/30 text-accent group-hover:bg-accent/20"
                      : "bg-primary/10 border-primary/30 text-primary group-hover:bg-primary/20 group-hover:glow-red-soft"
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 break-words">{item.info}</p>
                  </div>
                </div>
              );
              return (
                <div key={item.title} className="premium-card p-5 hover:border-primary/30 transition-colors">
                  {item.href ? (
                    <a href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined}>
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
