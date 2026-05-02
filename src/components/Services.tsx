import {
  Wrench, Network, Server, ShieldCheck, Database, Code2,
  Brain, Monitor, Users, Cable, CheckSquare, Activity, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import imgTI from "@/assets/espier-tecnica-interna.png";
import imgTelecom from "@/assets/espier-recepcao-petropolis.png";

const services = [
  { icon: Wrench, title: "Manutenção e Suporte", desc: "Atendimento presencial e remoto para manutenção preventiva e corretiva de computadores e periféricos.", benefits: ["Redução de downtime", "Maior vida útil"] },
  { icon: Network, title: "Redes e Infraestrutura", desc: "Projeto, implantação e gerenciamento de redes corporativas com alta disponibilidade.", benefits: ["Conectividade estável", "Escalabilidade"] },
  { icon: Server, title: "Servidores e Cloud", desc: "Configuração de servidores físicos e migração para nuvem com segurança e acesso remoto.", benefits: ["Disponibilidade 24/7", "Backup automático"] },
  { icon: ShieldCheck, title: "Segurança da Informação", desc: "Firewalls, antivírus corporativo, políticas de segurança e compliance.", benefits: ["Proteção total", "Conformidade"] },
  { icon: Database, title: "Backup e Recuperação", desc: "Estratégias de backup local e em nuvem com planos de recuperação de desastres.", benefits: ["Zero perda de dados", "Recuperação rápida"] },
  { icon: Code2, title: "Automação e Sistemas", desc: "Sistemas sob medida, automação de processos e integrações entre plataformas.", benefits: ["Processos otimizados", "Produtividade"] },
  { icon: Brain, title: "Consultoria em manutenção e infra estrutura", desc: "Análise completa da infraestrutura com planos estratégicos de evolução tecnológica.", benefits: ["ROI maximizado", "Planejamento"] },
  { icon: Monitor, title: "Venda de Equipamentos", desc: "Fornecimento de hardware de qualidade com instalação e configuração profissional.", benefits: ["Homologados", "Suporte incluso"] },
  { icon: Users, title: "Terceirização de manutenção e infra estrutura", desc: "Outsourcing completo de manutenção e infra estrutura com equipe dedicada e gerenciamento proativo.", benefits: ["Foco no negócio", "Custos previsíveis"] },
];

const cablingServices = [
  { icon: Cable, title: "Cabeamento Estruturado", desc: "Projetos completos com Cat5e, Cat6 e fibra óptica." },
  { icon: CheckSquare, title: "Organização e Padronização", desc: "Rack, patch panel, identificação e limpeza técnica." },
  { icon: Activity, title: "Certificação de Rede", desc: "Testes de desempenho e relatórios detalhados." },
];

const Services = () => (
  <section id="servicos" className="py-20 lg:py-32 section-dark-alt">
    <div className="section-container relative">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-20">
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)] aspect-[4/3] order-2 lg:order-1">
          <img
            src={imgTI}
            alt="Equipe técnica interna da Espier Telecom realizando manutenção e recuperação de equipamentos"
            loading="lazy"
            width={1280}
            height={832}
            className="w-full h-full object-cover"
          />
          <div className="img-overlay-dark opacity-75" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white">Laboratório técnico</p>
            <p className="text-lg sm:text-xl font-extrabold mt-2">Manutenção, diagnóstico e recuperação com padrão profissional</p>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="eyebrow">Serviços</span>
          <h2 className="h-section mt-3">
            Soluções completas em <span className="gradient-text">manutenção e infra estrutura</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-base sm:text-lg leading-relaxed">
            Cobertura total para sua infraestrutura tecnológica — do suporte técnico
            ao desenvolvimento de sistemas, com qualidade de empresa de grande porte.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-20">
        {services.map((s) => (
          <div
            key={s.title}
            className="group premium-card premium-card-hover p-6"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 flex items-center justify-center mb-4 group-hover:from-primary group-hover:to-red-700 group-hover:border-primary group-hover:glow-red-soft transition-all">
              <s.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-2 text-foreground">{s.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">{s.desc}</p>
            <div className="flex flex-wrap gap-2">
              {s.benefits.map((b) => (
                <span key={b} className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/25 font-semibold">
                  {b}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Destaque Cabeamento */}
      <div className="relative rounded-3xl overflow-hidden border border-border shadow-[0_30px_80px_-20px_rgba(15,23,42,0.2)]">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[300px] lg:min-h-full">
            <img
              src={imgTelecom}
              alt="Unidade Espier Telecom com atendimento exclusivo e operação comercial estruturada"
              loading="lazy"
              width={1280}
              height={832}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="img-overlay-red opacity-75" />
            <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/95">Atendimento exclusivo</p>
              <p className="text-xl sm:text-2xl font-extrabold mt-2">Estrutura comercial preparada para receber e orientar clientes</p>
            </div>
          </div>
          <div className="bg-card p-7 sm:p-10 lg:p-12">
            <span className="eyebrow">Destaque</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-3 mb-7 text-foreground">
              Cabeamento Estruturado &<br/>
              <span className="gradient-text">Certificação Profissional</span>
            </h3>
            <div className="space-y-5 mb-8">
              {cablingServices.map((c) => (
                <div key={c.title} className="flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <c.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{c.title}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-red font-bold">
              <a href="#contato">
                Solicitar Orçamento <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Services;
