import { Target, Eye, Heart, CheckCircle2 } from "lucide-react";
import imgSobre from "@/assets/espier-frota-matriz.png";

const values = [
  { icon: Target, title: "Missão", text: "Oferecer soluções tecnológicas de excelência que transformem a operação dos nossos clientes, garantindo segurança, performance e inovação." },
  { icon: Eye, title: "Visão", text: "Ser referência nacional em manutenção e infra estrutura e segurança eletrônica, reconhecida pela qualidade técnica e compromisso com resultados." },
  { icon: Heart, title: "Valores", text: "Ética, transparência, inovação contínua, compromisso com o cliente e busca incessante pela excelência técnica." },
];

const differentials = [
  "Equipe técnica certificada",
  "Atendimento personalizado",
  "Suporte 24 horas",
  "Soluções sob medida",
  "Tecnologia de ponta",
  "Garantia em todos os serviços",
];

const About = () => (
  <section id="sobre" className="py-20 lg:py-32 section-radial">
    <div className="section-container relative">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-20">
        <div>
          <span className="eyebrow">Sobre nós</span>
          <h2 className="h-section mt-3">
            Especialistas em <span className="gradient-text">TI, manutenção, infra estrutura</span> e{" "}
            <span className="gradient-text-green">segurança</span>
          </h2>
          <p className="mt-5 text-white/65 text-base sm:text-lg leading-relaxed">
            Com mais de 10 anos de atuação, somos referência em soluções de manutenção e infra
            estrutura e segurança eletrônica. Nossa equipe altamente qualificada entrega projetos
            com excelência técnica e compromisso total com o resultado.
          </p>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] aspect-[4/3]">
          <img
            src={imgSobre}
            alt="Matriz da Espier Telecom com frota operacional pronta para atendimento"
            loading="lazy"
            width={1280}
            height={832}
            className="w-full h-full object-cover"
          />
          <div className="img-overlay-red opacity-60" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
        {values.map((v) => (
          <div key={v.title} className="premium-card premium-card-hover p-7 group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center mb-5 glow-red-soft">
              <v.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{v.title}</h3>
            <p className="text-sm text-white/65 leading-relaxed">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="premium-card p-6 sm:p-10">
        <div className="text-center mb-8">
          <span className="eyebrow eyebrow-line">Nossos Diferenciais</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold mt-4 text-white">Por que empresas confiam na Espier</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {differentials.map((d) => (
            <div key={d} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/30 hover:bg-white/[0.05] transition-all">
              <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
              <span className="text-sm text-white/85 font-medium">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default About;
