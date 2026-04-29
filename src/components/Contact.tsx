import { useState } from "react";
import { Phone, Mail, MapPin, Send, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", mensagem: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contato de ${form.nome}`);
    const body = encodeURIComponent(
      `Nome: ${form.nome}\nE-mail: ${form.email}\nTelefone: ${form.telefone}\n\nMensagem:\n${form.mensagem}`
    );
    window.location.href = `mailto:espier.telecom@gmail.com?subject=${subject}&body=${body}`;
    toast({ title: "Mensagem enviada!", description: "Seu cliente de e-mail foi aberto para enviar a mensagem." });
    setForm({ nome: "", email: "", telefone: "", mensagem: "" });
  };

  const inputCls = "bg-white/[0.03] border-white/10 text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/20 h-12";

  return (
    <section id="contato" className="py-20 lg:py-32 section-dark-alt">
      <div className="section-container relative">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="eyebrow eyebrow-line">Contato</span>
          <h2 className="h-section mt-5">
            Fale <span className="gradient-text">conosco</span>
          </h2>
          <p className="mt-4 text-white/60 text-base sm:text-lg">
            Solicite um orçamento sem compromisso ou tire suas dúvidas. Resposta em até 24h úteis.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <form onSubmit={handleSubmit} className="premium-card p-7 sm:p-8 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Nome completo</label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">E-mail</label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Telefone</label>
                <Input
                  placeholder="(21) 9 0000-0000"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Mensagem</label>
              <Textarea
                placeholder="Conte-nos sua necessidade..."
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                required
                rows={5}
                className={inputCls + " h-auto resize-none"}
              />
            </div>
            <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-red font-bold uppercase tracking-wide">
              <Send className="w-4 h-4 mr-2" /> Enviar Mensagem
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
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <p className="text-sm text-white/60 mt-1 break-words">{item.info}</p>
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
