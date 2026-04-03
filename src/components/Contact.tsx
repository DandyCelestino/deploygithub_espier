import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
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
    window.open(`mailto:espier.telecom@gmail.com?subject=${subject}&body=${body}`, "_blank");
    toast({ title: "Mensagem enviada!", description: "Seu cliente de e-mail foi aberto para enviar a mensagem." });
    setForm({ nome: "", email: "", telefone: "", mensagem: "" });
  };

  return (
    <section id="contato" className="py-20 lg:py-32 bg-secondary/30">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-mono text-accent uppercase tracking-widest">Contato</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">
            Fale <span className="text-primary">conosco</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Solicite um orçamento sem compromisso ou tire suas dúvidas.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-5">
            <Input
              placeholder="Seu nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
              className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:text-accent"
            />
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:text-accent"
            />
            <Input
              placeholder="Seu telefone"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:text-accent"
            />
            <Textarea
              placeholder="Sua mensagem"
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
              required
              rows={5}
              className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:text-accent"
            />
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-red">
              <Send className="w-4 h-4 mr-2" /> Enviar Mensagem
            </Button>
          </form>

          {/* Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Telefone / WhatsApp</h4>
                <p className="text-muted-foreground">(21) 96000-1439</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1">E-mail</h4>
                <p className="text-muted-foreground">espier.telecom@gamil.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Endereço</h4>
                <p className="text-muted-foreground">Cachoeiras de Macacu — RJ</p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-xl overflow-hidden border border-border h-56 bg-secondary flex items-center justify-center">
              <iframe
                title="Localização"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1976509870974!2d-46.65432058502168!3d-23.56390938468053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1609459200000!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
