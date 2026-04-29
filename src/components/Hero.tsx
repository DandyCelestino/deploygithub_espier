import { ArrowRight, PhoneCall, Wrench, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/espier-campo-barra.png";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-24 lg:pt-28 overflow-hidden bg-background"
    >
      {/* Background image + gradientes premium */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Equipe de campo e frota da Espier Telecom em operação externa"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
          width={1920}
          height={1080}
        />
        {/* Camadas escuras */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        {/* Glows radiais vermelhos */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[140px]" />
        {/* Grid sutil */}
        <div className="absolute inset-0 grid-bg opacity-[0.04]" />
        {/* Vinheta */}
        <div className="absolute inset-0 img-overlay-vignette" />
      </div>

      <div className="section-container relative z-10 py-20">
        <div className="max-w-4xl">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 text-white text-xs sm:text-sm font-semibold mb-7 border border-primary/40 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Soluções em TI, Manutenção, Infra e Segurança Eletrônica
            </span>
          </div>

          <h1 className="h-display text-5xl sm:text-6xl lg:text-8xl animate-fade-up-delay-1 text-balance">
            Tecnologia que{" "}
            <span className="gradient-text">protege</span>{" "}
            <span className="block">e <span className="gradient-text-green">impulsiona</span></span>
            <span className="block text-white/85 text-4xl sm:text-5xl lg:text-6xl mt-2">seu negócio.</span>
          </h1>

          <p className="mt-7 text-base sm:text-lg lg:text-xl text-white/75 max-w-2xl animate-fade-up-delay-2 leading-relaxed">
            Manutenção, infra estrutura, cabeamento estruturado, segurança eletrônica
            e suporte técnico especializado. Tudo o que sua empresa precisa em um
            único parceiro de altíssimo padrão.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 sm:gap-4 animate-fade-up-delay-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-red text-base h-12 px-7 font-bold animate-glow-pulse"
            >
              <a href="#contato">
                Solicitar Orçamento <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white hover:border-white/30 text-base h-12 px-7 backdrop-blur font-bold"
            >
              <a href="#servicos">
                <Wrench className="w-5 h-5 mr-2" /> Nossos Serviços
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-accent/40 bg-accent/5 text-accent hover:bg-accent/15 hover:text-accent hover:border-accent/60 text-base h-12 px-7 backdrop-blur font-bold"
            >
              <a href="https://wa.me/5521960001439" target="_blank" rel="noreferrer">
                <PhoneCall className="w-5 h-5 mr-2" /> Fale Conosco
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-up-delay-3">
            {[
              { value: "5000+", label: "Clientes atendidos" },
              { value: "15+", label: "Anos de experiência" },
              { value: "24/7", label: "Suporte disponível" },
              { value: "99.9%", label: "Uptime garantido" },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left group">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold gradient-text-light group-hover:from-primary group-hover:to-white transition-all">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/55 mt-1.5 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 divider-glow" />
    </section>
  );
};

export default Hero;
