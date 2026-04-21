import { ArrowRight, PhoneCall, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background image with strong professional gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Data center corporativo de grande porte com infraestrutura de TI"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        {/* Degradê forte do preto (esquerda) para vermelho translúcido (direita) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      <div className="section-container relative z-10 py-20">
        <div className="max-w-3xl">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-white text-sm font-medium mb-6 border border-primary/40 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-accent" />
              Soluções completas em TI & Segurança
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight animate-fade-up-delay-1 font-heading text-white drop-shadow-lg">
            Tecnologia que{" "}
            <span className="gradient-text-green">Protege</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl animate-fade-up-delay-2 leading-relaxed drop-shadow">
            Infraestrutura de TI, cabeamento estruturado, segurança eletrônica e
            suporte técnico especializado. Tudo o que sua empresa precisa em um
            único parceiro.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 sm:gap-4 animate-fade-up-delay-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-red text-base animate-glow-pulse"
            >
              <a href="#contato">
                Solicitar Orçamento <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/40 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white/60 text-base backdrop-blur-sm"
            >
              <a href="#contato">
                <PhoneCall className="w-5 h-5 mr-2" /> Fale Conosco
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-accent/60 text-accent bg-black/30 hover:bg-accent/20 hover:text-accent hover:border-accent text-base backdrop-blur-sm"
            >
              <a href="#servicos">
                <Wrench className="w-5 h-5 mr-2" /> Nossos Serviços
              </a>
            </Button>
          </div>

          {/* Stats — duas colunas no mobile */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-up-delay-3">
            {[
              { value: "500+", label: "Clientes atendidos" },
              { value: "10+", label: "Anos de experiência" },
              { value: "24/7", label: "Suporte disponível" },
              { value: "99.9%", label: "Uptime garantido" },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left group">
                <div className="text-2xl sm:text-3xl font-bold text-accent group-hover:drop-shadow-[0_0_12px_hsl(145_70%_38%/0.7)] transition-all">{stat.value}</div>
                <div className="text-sm text-white/80 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
    </section>
  );
};

export default Hero;
