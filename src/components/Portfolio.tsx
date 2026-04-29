import imgTI from "@/assets/espier-tecnica-interna.png";
import imgSeguranca from "@/assets/espier-campo-barra.png";
import imgRecepcaoComercial from "@/assets/espier-recepcao-comercial.png";
import imgInfraLogistica from "@/assets/espier-infra-logistica.png";
import imgSobre from "@/assets/espier-campo-barra.png";

const projects = [
  { img: imgRecepcaoComercial, title: "Atendimento Corporativo", category: "Relacionamento & Comercial", desc: "Estrutura profissional para atendimento consultivo e apresentação de soluções sob medida." },
  { img: imgSeguranca, title: "Operação em Campo", category: "Segurança Eletrônica", desc: "Equipes e frota preparadas para instalações, suporte técnico e atendimento externo com agilidade." },
  { img: imgTI, title: "Laboratório Técnico", category: "Manutenção & Recuperação", desc: "Diagnóstico, manutenção e recuperação de equipamentos com organização e padrão profissional." },
  { img: imgInfraLogistica, title: "Matriz Operacional", category: "Infraestrutura & Logística", desc: "Base estruturada para coordenar equipes, frota e projetos de alta demanda com eficiência." },
  { img: imgRecepcaoComercial, title: "Recepção Exclusiva", category: "Experiência do Cliente", desc: "Ambiente preparado para receber clientes com proximidade, confiança e atendimento personalizado." },
  { img: imgSobre, title: "Presença de Marca", category: "Credibilidade", desc: "Imagem institucional forte que transmite solidez, prontidão operacional e alto padrão de execução." },
];

const Portfolio = () => (
  <section id="portfolio" className="py-20 lg:py-32 section-dark-alt">
    <div className="section-container relative">
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
        <span className="eyebrow eyebrow-line">Portfólio</span>
        <h2 className="h-section mt-5">
          Estrutura corporativa, <span className="gradient-text">nossa marca</span> de qualidade
        </h2>
        <p className="mt-4 text-white/60 text-base sm:text-lg">
          Relacionamento, profissionalismo e competência — contenção de custos com manutenção,
          logística e infra estrutura.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {projects.map((p, i) => (
          <div
            key={i}
            className="group premium-card overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-[0_25px_60px_-20px_hsl(0_80%_52%/0.45)]"
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={p.img}
                alt={p.title}
                loading="lazy"
                width={1280}
                height={960}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/90 backdrop-blur-sm">
                  {p.category}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-lg sm:text-xl font-extrabold text-white mb-1">{p.title}</h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed line-clamp-2">{p.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Portfolio;
