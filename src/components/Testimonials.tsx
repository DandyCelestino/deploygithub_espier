import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Carlos Eduardo", role: "CEO — LogTech Transportes", text: "A Espier.Telecom transformou nossa manutenção e infra estrutura. O cabeamento estruturado ficou impecável e o suporte é excepcional. Recomendo fortemente!" },
  { name: "Ana Paula Ferreira", role: "Diretora — Clínica Saúde+", text: "Instalaram câmeras e controle de acesso em nossa clínica com total profissionalismo. O monitoramento remoto nos dá tranquilidade 24 horas." },
  { name: "Roberto Mendes", role: "Gerente de manutenção e infra estrutura — Construtora ABC", text: "A migração para a nuvem foi perfeita. Zero downtime e performance muito superior. A equipe da Espier.Telecom é extremamente competente e organizada." },
  { name: "Juliana Santos", role: "Proprietária — JS Contabilidade", text: "Com a terceirização de manutenção e infra estrutura da Espier.Telecom, podemos focar 100% nos nossos clientes. O suporte é rápido e sempre resolve tudo." },
];

const Testimonials = () => (
  <section id="depoimentos" className="py-20 lg:py-32 relative bg-secondary/40">
    <div className="section-container relative">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span className="text-sm font-mono text-primary uppercase tracking-widest font-semibold">Depoimentos</span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 text-sidebar-foreground">
          O que nossos <span className="gradient-text">clientes</span> dizem
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 sm:p-8 hover:border-primary/30 transition-all group hover:shadow-lg">
            <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-primary/30 mb-3 sm:mb-4 group-hover:text-primary/60 transition-colors" />
            <p className="text-foreground/80 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base lg:text-lg">{t.text}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground text-sm sm:text-base">{t.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t.role}</p>
              </div>
              <div className="flex gap-0.5 sm:gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-accent text-accent" />
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
