import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Carlos Eduardo", role: "CEO — LogTech Transportes", text: "A Espier.Telecom transformou nossa manutenção e infra estrutura. O cabeamento estruturado ficou impecável e o suporte é excepcional. Recomendo fortemente!" },
  { name: "Ana Paula Ferreira", role: "Diretora — Clínica Saúde+", text: "Instalaram câmeras e controle de acesso em nossa clínica com total profissionalismo. O monitoramento remoto nos dá tranquilidade 24 horas." },
  { name: "Roberto Mendes", role: "Gerente de manutenção e infra estrutura — Construtora ABC", text: "A migração para a nuvem foi perfeita. Zero downtime e performance muito superior. A equipe da Espier.Telecom é extremamente competente e organizada." },
  { name: "Juliana Santos", role: "Proprietária — JS Contabilidade", text: "Com a terceirização de manutenção e infra estrutura da Espier.Telecom, podemos focar 100% nos nossos clientes. O suporte é rápido e sempre resolve tudo." },
];

const Testimonials = () => (
  <section id="depoimentos" className="py-20 lg:py-32 section-radial overflow-hidden">
    <div className="section-container relative">
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
        <span className="eyebrow eyebrow-line">Depoimentos</span>
        <h2 className="h-section mt-5">
          O que nossos <span className="gradient-text">clientes</span> dizem
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="premium-card premium-card-hover p-7 sm:p-8 group relative">
            <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/20 group-hover:text-primary/40 transition-colors" />
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-white/80 mb-6 leading-relaxed text-base lg:text-lg italic">"{t.text}"</p>
            <div className="pt-4 border-t border-white/10">
              <p className="font-bold text-white">{t.name}</p>
              <p className="text-sm text-white/55 mt-0.5">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
