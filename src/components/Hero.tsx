import { ArrowRight, PhoneCall, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Infraestrutura de TI e Segurança"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/95" />
      </div>

      <div className="section-container relative z-10 py-20">
        <div className="max-w-3xl">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
              <Zap className="w-3.5 h-3.5" />
              Soluções completas em TI & Segurança
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight animate-fade-up-delay-1 font-heading text-foreground">
            Tecnologia que{" "}
            <span className="gradient-text">Protege</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl animate-fade-up-delay-2 leading-relaxed">
            Infraestrutura de TI, cabeamento estruturado, segurança eletrônica e
            suporte técnico especializado. Tudo o que sua empresa precisa em um
            único parceiro.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 animate-fade-up-delay-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green text-base animate-glow-pulse"
            >
              <a href="#contato">
                Solicitar Orçamento <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border text-foreground hover:bg-secondary hover:border-primary/30 text-base backdrop-blur-sm"
            >
              <a href="https://wa.me/5521960001439" target="_blank" rel="noopener noreferrer">
                <PhoneCall className="w-5 h-5 mr-2" /> Fale Conosco
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 text-base"
            >
              <a href="#servicos">
                <Wrench className="w-5 h-5 mr-2" /> Nossos Serviços
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-up-delay-3">
            {[
              { value: "500+", label: "Clientes atendidos" },
              { value: "10+", label: "Anos de experiência" },
              { value: "24/7", label: "Suporte disponível" },
              { value: "99.9%", label: "Uptime garantido" },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left group">
                <div className="text-2xl sm:text-3xl font-bold text-primary group-hover:drop-shadow-[0_0_12px_hsl(145_70%_40%/0.5)] transition-all">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </section>
  );
};

export default Hero;
