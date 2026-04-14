import { ArrowRight, PhoneCall, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-accent/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-primary/5 rounded-full blur-[80px]" style={{ animation: "float 6s ease-in-out infinite" }} />
      </div>

      <div className="section-container relative z-10 py-20">
        <div className="max-w-3xl">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-primary text-sm font-medium mb-6 border-primary/20">
              <Zap className="w-3.5 h-3.5" />
              Soluções completas em TI & Segurança
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight animate-fade-up-delay-1 font-heading">
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
              className="border-border/50 text-foreground hover:bg-secondary hover:border-primary/30 text-base backdrop-blur-sm"
            >
              <a href="https://wa.me/5521960001439" target="_blank" rel="noopener noreferrer">
                <PhoneCall className="w-5 h-5 mr-2" /> Fale Conosco
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 text-base"
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
                <div className="text-2xl sm:text-3xl font-bold text-primary group-hover:drop-shadow-[0_0_12px_hsl(0_85%_55%/0.5)] transition-all">{stat.value}</div>
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
