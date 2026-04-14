import {
  Wrench, Network, Server, ShieldCheck, Database, Code2,
  Brain, Monitor, Users, Cable, CheckSquare, Activity, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  { icon: Wrench, title: "Manutenção e Suporte", desc: "Atendimento presencial e remoto para manutenção preventiva e corretiva de computadores e periféricos.", benefits: ["Redução de downtime", "Maior vida útil"] },
  { icon: Network, title: "Redes e Infraestrutura", desc: "Projeto, implantação e gerenciamento de redes corporativas com alta disponibilidade.", benefits: ["Conectividade estável", "Escalabilidade"] },
  { icon: Server, title: "Servidores e Cloud", desc: "Configuração de servidores físicos e migração para nuvem com segurança e acesso remoto.", benefits: ["Disponibilidade 24/7", "Backup automático"] },
  { icon: ShieldCheck, title: "Segurança da Informação", desc: "Firewalls, antivírus corporativo, políticas de segurança e compliance.", benefits: ["Proteção total", "Conformidade"] },
  { icon: Database, title: "Backup e Recuperação", desc: "Estratégias de backup local e em nuvem com planos de recuperação de desastres.", benefits: ["Zero perda de dados", "Recuperação rápida"] },
  { icon: Code2, title: "Automação e Sistemas", desc: "Sistemas sob medida, automação de processos e integrações entre plataformas.", benefits: ["Processos otimizados", "Produtividade"] },
  { icon: Brain, title: "Consultoria em TI", desc: "Análise completa da infraestrutura com planos estratégicos de evolução tecnológica.", benefits: ["ROI maximizado", "Planejamento"] },
  { icon: Monitor, title: "Venda de Equipamentos", desc: "Fornecimento de hardware de qualidade com instalação e configuração profissional.", benefits: ["Homologados", "Suporte incluso"] },
  { icon: Users, title: "Terceirização de TI", desc: "Outsourcing completo de TI com equipe dedicada e gerenciamento proativo.", benefits: ["Foco no negócio", "Custos previsíveis"] },
];

const cablingServices = [
  { icon: Cable, title: "Cabeamento Estruturado", desc: "Projetos completos com Cat5e, Cat6 e fibra óptica." },
  { icon: CheckSquare, title: "Organização e Padronização", desc: "Rack, patch panel, identificação e limpeza técnica." },
  { icon: Activity, title: "Certificação de Rede", desc: "Testes de desempenho e relatórios detalhados." },
];

const Services = () => (
  <section id="servicos" className="py-20 lg:py-32 relative">
    <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-transparent to-secondary/30" />
    <div className="section-container relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-sm font-mono text-accent uppercase tracking-widest">Serviços</span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">
          Soluções completas em <span className="text-primary">TI</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Cobertura total para sua infraestrutura tecnológica — do suporte técnico
          ao desenvolvimento de sistemas.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
        {services.map((s) => (
          <div
            key={s.title}
            className="group glass-card rounded-xl p-6 hover:border-primary/30 transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all">
              <s.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{s.desc}</p>
            <div className="flex flex-wrap gap-2">
              {s.benefits.map((b) => (
                <span key={b} className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                  {b}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cabling highlight */}
      <div className="relative rounded-2xl overflow-hidden border border-primary/20 glow-red">
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-background via-background/95 to-primary/5" />
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="relative z-10 p-8 lg:p-12">
          <span className="text-sm font-mono text-primary uppercase tracking-widest">Destaque</span>
          <h3 className="text-2xl lg:text-3xl font-bold mt-2 mb-8">
            Cabeamento Estruturado & Certificação
          </h3>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {cablingServices.map((c) => (
              <div key={c.title} className="glass-card rounded-xl p-6">
                <c.icon className="w-8 h-8 text-accent mb-3" />
                <h4 className="font-bold mb-2">{c.title}</h4>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 glow-red">
            <a href="#contato">
              Solicitar Projeto <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default Services;
