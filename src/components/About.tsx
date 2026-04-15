import { Target, Eye, Heart, CheckCircle2 } from "lucide-react";

const values = [
  { icon: Target, title: "Missão", text: "Oferecer soluções tecnológicas de excelência que transformem a operação dos nossos clientes, garantindo segurança, performance e inovação." },
  { icon: Eye, title: "Visão", text: "Ser referência nacional em TI e segurança eletrônica, reconhecida pela qualidade técnica e compromisso com resultados." },
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
  <section id="sobre" className="py-20 lg:py-32 relative bg-secondary/30">
    <div className="section-container relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-sm font-mono text-primary uppercase tracking-widest font-semibold">Sobre nós</span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 text-foreground">
          Especialistas em <span className="gradient-text">tecnologia</span> e{" "}
          <span className="gradient-text">segurança</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Com mais de 10 anos de atuação, somos referência em soluções de TI e segurança
          eletrônica. Nossa equipe altamente qualificada entrega projetos com excelência
          técnica e compromisso total com o resultado.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {values.map((v) => (
          <div key={v.title} className="glass-card rounded-xl p-8 hover:border-primary/30 transition-all group hover:-translate-y-1 hover:shadow-lg">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all">
              <v.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">{v.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-8 lg:p-12">
        <h3 className="text-2xl font-bold mb-8 text-center text-foreground">Nossos Diferenciais</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {differentials.map((d) => (
            <div key={d} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default About;
