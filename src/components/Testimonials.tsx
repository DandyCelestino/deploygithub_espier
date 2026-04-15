import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Carlos Eduardo", role: "CEO — LogTech Transportes", text: "A Espier.Telecom transformou nossa infraestrutura de TI. O cabeamento estruturado ficou impecável e o suporte é excepcional. Recomendo fortemente!" },
  { name: "Ana Paula Ferreira", role: "Diretora — Clínica Saúde+", text: "Instalaram câmeras e controle de acesso em nossa clínica com total profissionalismo. O monitoramento remoto nos dá tranquilidade 24 horas." },
  { name: "Roberto Mendes", role: "Gerente de TI — Construtora ABC", text: "A migração para a nuvem foi perfeita. Zero downtime e performance muito superior. A equipe da Espier.Telecom é extremamente competente e organizada." },
  { name: "Juliana Santos", role: "Proprietária — JS Contabilidade", text: "Com a terceirização de TI da Espier.Telecom, podemos focar 100% nos nossos clientes. O suporte é rápido e sempre resolve tudo." },
];

const Testimonials = () => (
  <section id="depoimentos" className="py-20 lg:py-32 relative bg-secondary/30">
    <div className="section-container relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-sm font-mono text-primary uppercase tracking-widest font-semibold">Depoimentos</span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 text-foreground">
          O que nossos <span className="gradient-text">clientes</span> dizem
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="glass-card rounded-2xl p-8 hover:border-primary/20 transition-all group hover:shadow-lg">
            <Quote className="w-8 h-8 text-primary/20 mb-4 group-hover:text-primary/40 transition-colors" />
            <p className="text-foreground/80 mb-6 leading-relaxed text-lg">{t.text}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
