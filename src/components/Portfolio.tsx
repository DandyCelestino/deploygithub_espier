import { Cable, Camera, Cloud, Network, ShieldCheck, Users, LucideIcon } from "lucide-react";

const projects: { icon: LucideIcon; title: string; category: string; desc: string }[] = [
  { icon: Cable, title: "Data Center Corporativo", category: "Cabeamento Estruturado", desc: "Projeto completo de cabeamento Cat6 com certificação para empresa de 200 pontos." },
  { icon: Camera, title: "Monitoramento Industrial", category: "Segurança Eletrônica", desc: "Sistema de CFTV com 48 câmeras IP e monitoramento remoto 24h." },
  { icon: Cloud, title: "Infraestrutura Cloud", category: "Cloud Computing", desc: "Migração completa de servidores on-premise para nuvem com zero downtime." },
  { icon: Network, title: "Rede Hospitalar", category: "Redes & Infraestrutura", desc: "Rede de alta disponibilidade para hospital com 500 leitos e redundância total." },
  { icon: ShieldCheck, title: "Condomínio Inteligente", category: "Segurança & Automação", desc: "Controle de acesso, CFTV e automação integrados em condomínio residencial." },
  { icon: Users, title: "Outsourcing Completo", category: "Terceirização de TI", desc: "Gestão completa de TI para escritório de advocacia com 80 estações." },
];

const Portfolio = () => (
  <section id="portfolio" className="py-20 lg:py-32 bg-secondary/30">
    <div className="section-container">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-sm font-mono text-accent uppercase tracking-widest">Portfólio</span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">
          Projetos que <span className="text-primary">comprovam</span> nossa qualidade
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Conheça alguns dos projetos que realizamos com excelência técnica.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p, i) => (
          <div key={i} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1">
            <div className="h-48 flex items-center justify-center bg-secondary/50">
              <p.icon className="w-16 h-16 text-primary group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <span className="text-xs font-mono text-accent uppercase">{p.category}</span>
              <h3 className="text-lg font-bold mt-1 mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Portfolio;
