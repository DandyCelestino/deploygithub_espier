import { Camera, Wifi, Bell, Fingerprint, Zap, Cpu, Link2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import imgSeguranca from "@/assets/espier-campo-barra.png";

const securityServices = [
  { icon: Camera, title: "CFTV", desc: "Câmeras IP, analógicas e monitoramento com acesso remoto via smartphone." },
  { icon: Wifi, title: "Monitoramento Remoto", desc: "Acompanhe câmeras e alarmes em tempo real de qualquer lugar, 24h." },
  { icon: Bell, title: "Alarmes", desc: "Sensores de presença, abertura e sirenes integradas." },
  { icon: Fingerprint, title: "Controle de Acesso", desc: "Catracas, biometria e cartões de proximidade." },
  { icon: Zap, title: "Cercas Elétricas", desc: "Instalação e manutenção com central de choque monitorada." },
  { icon: Cpu, title: "Automação", desc: "Portões, iluminação e sistemas com controle centralizado." },
  { icon: Link2, title: "Integração Inteligente", desc: "Câmeras, alarmes e controle de acesso em um único sistema." },
];

const Security = () => (
  <section id="seguranca" className="py-20 lg:py-32 relative bg-secondary/40">
    <div className="section-container relative">
      <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
        <div>
          <span className="text-sm font-mono text-primary uppercase tracking-widest font-semibold">Segurança Eletrônica</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 text-sidebar-foreground">
            Manutenção e infra estrutura e segurança patrimonial
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
            Soluções completas de segurança eletrônica com manutenção e infra estrutura de ponta,
            instalação profissional e suporte contínuo — padrão de empresas de grande porte.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 glow-red">
            <a href="#contato">
              Solicitar Orçamento <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-xl aspect-[4/3]">
          <img
            src={imgSeguranca}
            alt="Equipe de campo da Espier Telecom e frota pronta para operações de segurança"
            loading="lazy"
            width={1280}
            height={832}
            className="w-full h-full object-cover"
          />
          <div className="img-overlay-dark opacity-70" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs font-mono uppercase tracking-widest text-accent">Equipe de campo</p>
            <p className="text-lg sm:text-xl font-bold mt-1">Prontidão técnica para instalações e atendimento</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
        {securityServices.map((s) => (
          <div
            key={s.title}
            className="group glass-card rounded-xl p-4 sm:p-6 hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-all">
              <s.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2 text-foreground">{s.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Security;
