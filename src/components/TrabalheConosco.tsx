import { useState } from "react";
import { z } from "zod";
import { Briefcase, Send, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CARGOS = ["Técnico", "Gerente", "Vendedor", "Call Center"];
const MODALIDADES = ["Freelance", "Home Office", "CLT", "Colaborador", "Parceiro", "Fornecedor"];

const candidaturaSchema = z.object({
  nome_completo: z.string().trim().min(3, "Nome muito curto").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  telefone: z.string().trim().min(8, "Telefone inválido").max(30),
  cpf: z.string().trim().min(11, "CPF inválido").max(20),
  endereco: z.string().trim().min(5, "Endereço muito curto").max(255),
  cargo_desejado: z.string().trim().min(2, "Informe o cargo").max(120),
  experiencia: z.string().trim().min(10, "Descreva sua experiência").max(2000),
  disponibilidade: z.string().trim().min(2, "Informe sua disponibilidade").max(120),
  curriculo_url: z.string().trim().url("URL inválida").max(500).optional().or(z.literal("")),
  mensagem: z.string().trim().max(1000).optional().or(z.literal("")),
});

type FormState = z.input<typeof candidaturaSchema>;

const initial: FormState = {
  nome_completo: "",
  email: "",
  telefone: "",
  cpf: "",
  endereco: "",
  cargo_desejado: "",
  experiencia: "",
  disponibilidade: "",
  curriculo_url: "",
  mensagem: "",
};

const TrabalheConosco = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const inputCls =
    "bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12";

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = candidaturaSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast({
        title: "Verifique o formulário",
        description: first?.message ?? "Dados inválidos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const d = parsed.data;
    const { error } = await supabase.from("candidaturas").insert({
      nome_completo: d.nome_completo,
      email: d.email,
      telefone: d.telefone,
      cpf: d.cpf,
      endereco: d.endereco,
      cargo_desejado: d.cargo_desejado,
      experiencia: d.experiencia,
      disponibilidade: d.disponibilidade,
      curriculo_url: d.curriculo_url || null,
      mensagem: d.mensagem || null,
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar seu cadastro. Tente novamente em instantes.",
        variant: "destructive",
      });
      return;
    }

    setSent(true);
    setForm(initial);
    toast({
      title: "Cadastro enviado!",
      description: "Avaliaremos seu cadastro e retornaremos em até 72 horas.",
    });
  };

  return (
    <section id="trabalhe-conosco" className="py-20 lg:py-32 section-dark">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="eyebrow eyebrow-line">Carreira</span>
          <h2 className="h-section mt-5">
            Trabalhe <span className="gradient-text">conosco</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Cadastre-se agora mesmo. <strong className="text-foreground">Avaliaremos seu cadastro e retornaremos em no máximo 72 horas.</strong>
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold">
            <Clock className="w-4 h-4" /> Resposta garantida em até 72h
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar info */}
          <div className="space-y-4 lg:col-span-1">
            <div className="premium-card p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Faça parte do time</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Buscamos profissionais comprometidos com excelência em TI, Telecom e Segurança Eletrônica.
              </p>
            </div>
            <div className="premium-card p-6">
              <h4 className="font-bold text-foreground mb-3">Como funciona</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Preencha o cadastro completo abaixo</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Nosso RH analisa seu perfil</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Retornamos em até 72 horas</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="premium-card p-7 sm:p-8 space-y-4 lg:col-span-2">
            {sent && (
              <div className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-3 text-sm text-foreground flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p>
                  Cadastro recebido! Nossa equipe avaliará seu perfil e retornaremos em até <strong>72 horas</strong> pelo e-mail informado.
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nome completo *">
                <Input className={inputCls} value={form.nome_completo} onChange={update("nome_completo")} required maxLength={120} />
              </Field>
              <Field label="E-mail *">
                <Input type="email" className={inputCls} value={form.email} onChange={update("email")} required maxLength={255} />
              </Field>
              <Field label="Telefone *">
                <Input className={inputCls} placeholder="(21) 9 0000-0000" value={form.telefone} onChange={update("telefone")} required maxLength={30} />
              </Field>
              <Field label="CPF *">
                <Input className={inputCls} placeholder="000.000.000-00" value={form.cpf} onChange={update("cpf")} required maxLength={20} />
              </Field>
            </div>

            <Field label="Endereço completo *">
              <Input className={inputCls} placeholder="Rua, número, bairro, cidade - UF" value={form.endereco} onChange={update("endereco")} required maxLength={255} />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Cargo desejado *">
                <Input className={inputCls} placeholder="Ex: Técnico de Telecom" value={form.cargo_desejado} onChange={update("cargo_desejado")} required maxLength={120} />
              </Field>
              <Field label="Disponibilidade *">
                <Input className={inputCls} placeholder="Ex: Imediata / 30 dias" value={form.disponibilidade} onChange={update("disponibilidade")} required maxLength={120} />
              </Field>
            </div>

            <Field label="Experiência profissional *">
              <Textarea
                className={inputCls + " h-auto resize-none"}
                rows={4}
                placeholder="Descreva sua experiência, formação e principais habilidades..."
                value={form.experiencia}
                onChange={update("experiencia")}
                required
                maxLength={2000}
              />
            </Field>

            <Field label="Link do currículo (Drive, LinkedIn, etc.)">
              <Input
                className={inputCls}
                type="url"
                placeholder="https://..."
                value={form.curriculo_url}
                onChange={update("curriculo_url")}
                maxLength={500}
              />
            </Field>

            <Field label="Mensagem adicional (opcional)">
              <Textarea
                className={inputCls + " h-auto resize-none"}
                rows={3}
                placeholder="Algo mais que gostaria de compartilhar..."
                value={form.mensagem}
                onChange={update("mensagem")}
                maxLength={1000}
              />
            </Field>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-red font-bold uppercase tracking-wide"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Enviando..." : "Enviar Cadastro"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Ao enviar, você concorda com o uso dos seus dados para fins de processo seletivo.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2">{label}</label>
    {children}
  </div>
);

export default TrabalheConosco;
