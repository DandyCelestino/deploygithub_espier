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
  <section id="sobre" className="py-20 lg:py-32">
    <div className="section-container">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-sm font-mono text-accent uppercase tracking-widest">Sobre nós</span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">
          Especialistas em <span className="text-primary">tecnologia</span> e{" "}
          <span className="text-accent">segurança</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Com mais de 10 anos de atuação, somos referência em soluções de TI e segurança
          eletrônica. Nossa equipe altamente qualificada entrega projetos com excelência
          técnica e compromisso total com o resultado.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {values.map((v) => (
          <div key={v.title} className="bg-card text-card-foreground border border-border rounded-lg p-8 hover:border-primary/40 transition-colors">
            <v.icon className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-3 text-card-foreground">{v.title}</h3>
            <p className="text-card-foreground/70">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-card text-card-foreground border border-border rounded-lg p-8 lg:p-12">
        <h3 className="text-2xl font-bold mb-6 text-center text-card-foreground">Nossos Diferenciais</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {differentials.map((d) => (
            <div key={d} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
              <span className="text-card-foreground">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default About;
