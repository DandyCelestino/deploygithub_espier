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
  <section id="servicos" className="py-20 lg:py-32 relative">
    <div className="section-container relative">
      <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl aspect-[4/3] order-2 lg:order-1">
          <img
            src={imgTI}
            alt="Equipe técnica interna da Espier Telecom realizando manutenção e recuperação de equipamentos"
            loading="lazy"
            width={1280}
            height={832}
            className="w-full h-full object-cover"
          />
          <div className="img-overlay-dark opacity-70" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs font-mono uppercase tracking-widest text-accent">Laboratório técnico</p>
            <p className="text-lg sm:text-xl font-bold mt-1">Manutenção, diagnóstico e recuperação com padrão profissional</p>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="text-sm font-mono text-primary uppercase tracking-widest font-semibold">Serviços</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 text-sidebar-foreground">
            Soluções completas em <span className="gradient-text">manutenção e infra estrutura</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
            Cobertura total para sua infraestrutura tecnológica — do suporte técnico
            ao desenvolvimento de sistemas, com qualidade de empresa de grande porte.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 mb-20">
        {services.map((s) => (
          <div
            key={s.title}
            className="group glass-card rounded-xl p-4 sm:p-6 hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-all">
              <s.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold mb-1 sm:mb-2 text-foreground">{s.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">{s.desc}</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {s.benefits.map((b) => (
                <span key={b} className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                  {b}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-xl">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[280px] lg:min-h-full">
            <img
              src={imgTelecom}
              alt="Unidade Espier Telecom com atendimento exclusivo e operação comercial estruturada"
              loading="lazy"
              width={1280}
              height={832}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="img-overlay-red opacity-75" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-xs font-mono uppercase tracking-widest text-white/90">Atendimento exclusivo</p>
              <p className="text-lg sm:text-xl font-bold mt-1">Estrutura comercial preparada para receber e orientar clientes</p>
            </div>
          </div>
          <div className="bg-white p-6 sm:p-8 lg:p-12">
            <span className="text-sm font-mono text-primary uppercase tracking-widest font-semibold">Destaque</span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-2 mb-6 sm:mb-8 text-foreground">
              Cabeamento Estruturado & Certificação
            </h3>
            <div className="grid sm:grid-cols-1 gap-4 mb-6 sm:mb-8">
              {cablingServices.map((c) => (
                <div key={c.title} className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <c.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{c.title}</h4>
                    <p className="text-sm text-muted-foreground">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 glow-red">
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
