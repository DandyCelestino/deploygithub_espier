import { ArrowRight, PhoneCall, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.png";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="Tecnologia" className="w-full h-full object-cover opacity-40" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      <div className="section-container relative z-10 py-20">
        <div className="max-w-3xl">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Soluções completas em TI & Segurança
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight animate-fade-up-delay-1">
            Tecnologia que{" "}
            <span className="gradient-text">protege</span> e{" "}
            <span className="gradient-text">impulsiona</span> seu negócio
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl animate-fade-up-delay-2">
            Infraestrutura de TI, cabeamento estruturado, segurança eletrônica e
            suporte técnico especializado. Tudo o que sua empresa precisa em um
            único parceiro.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 animate-fade-up-delay-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-red text-base"
            >
              <a href="#contato">
                Solicitar Orçamento <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border text-foreground hover:bg-secondary text-base"
            >
              <a href="https://wa.me/5521960001439" target="_blank" rel="noopener noreferrer">
                <PhoneCall className="w-5 h-5 mr-2" /> Fale Conosco
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-accent/40 text-accent hover:bg-accent/10 text-base"
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
              <div key={stat.label} className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
