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
  <section id="sobre" className="py-20 lg:py-32 relative bg-secondary/40">
    <div className="section-container relative">
      <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
        <div>
          <span className="text-sm font-mono text-primary uppercase tracking-widest font-semibold">Sobre nós</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 text-sidebar-foreground">
            Especialistas em <span className="gradient-text">manutenção e infra estrutura</span> e{" "}
            <span className="gradient-text-green">segurança</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
            Com mais de 10 anos de atuação, somos referência em soluções de manutenção e infra estrutura e segurança
            eletrônica. Nossa equipe altamente qualificada entrega projetos com excelência
            técnica e compromisso total com o resultado.
          </p>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg aspect-[4/3]">
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-16">
        {values.map((v) => (
          <div key={v.title} className="glass-card rounded-xl p-5 sm:p-8 hover:border-primary/30 transition-all group hover:-translate-y-1 hover:shadow-lg">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-primary/20 transition-all">
              <v.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground">{v.title}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-6 sm:p-8 lg:p-12">
        <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center text-foreground">Nossos Diferenciais</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {differentials.map((d) => (
            <div key={d} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-primary/5 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
              <span className="text-sm sm:text-base text-foreground">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default About;
