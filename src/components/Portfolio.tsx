import imgTI from "@/assets/img-ti.jpg";
import imgSeguranca from "@/assets/img-seguranca.jpg";
import imgTelecom from "@/assets/img-telecom.jpg";
import imgCftv from "@/assets/img-cftv.jpg";
import imgAcesso from "@/assets/img-acesso.jpg";
import imgSobre from "@/assets/img-sobre.jpg";

const projects = [
  { img: imgTelecom, title: "Data Center Corporativo", category: "Cabeamento Estruturado", desc: "Projeto completo de cabeamento Cat6 com certificação para empresa de 200 pontos." },
  { img: imgSeguranca, title: "Monitoramento Industrial", category: "Segurança Eletrônica", desc: "Sistema de CFTV com 48 câmeras IP e monitoramento remoto 24h." },
  { img: imgTI, title: "Infraestrutura Cloud", category: "Cloud Computing", desc: "Migração completa de servidores on-premise para nuvem com zero downtime." },
  { img: imgCftv, title: "Rede Hospitalar", category: "Redes & Infraestrutura", desc: "Rede de alta disponibilidade para hospital com 500 leitos e redundância total." },
  { img: imgAcesso, title: "Condomínio Inteligente", category: "Segurança & Automação", desc: "Controle de acesso, CFTV e automação integrados em condomínio residencial." },
  { img: imgSobre, title: "Outsourcing Completo", category: "Terceirização de TI", desc: "Gestão completa de TI para escritório de advocacia com 80 estações." },
];

const Portfolio = () => (
  <section id="portfolio" className="py-20 lg:py-32 relative">
    <div className="section-container relative">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span className="text-sm font-mono text-primary uppercase tracking-widest font-semibold">Portfólio</span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 text-foreground">
          Projetos que <span className="gradient-text">comprovam</span> nossa qualidade
        </h2>
        <p className="mt-4 text-muted-foreground text-base sm:text-lg">
          Conheça alguns dos projetos que realizamos com excelência técnica.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {projects.map((p, i) => (
          <div key={i} className="group glass-card rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={p.img}
                alt={p.title}
                loading="lazy"
                width={1280}
                height={960}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                <span className="text-[10px] sm:text-xs font-mono text-white uppercase tracking-wider font-semibold px-2 py-1 rounded bg-primary/90 backdrop-blur-sm">{p.category}</span>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-sm sm:text-lg font-bold mb-1 sm:mb-2 text-foreground">{p.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Portfolio;
