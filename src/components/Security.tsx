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
  <section id="seguranca" className="py-20 lg:py-32 section-radial">
    <div className="section-container relative">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16">
        <div>
          <span className="eyebrow">Segurança Eletrônica</span>
          <h2 className="h-section mt-3">
            Equipes treinadas <span className="gradient-text">constantemente.</span>
          </h2>
          <p className="mt-5 text-white/65 text-base sm:text-lg leading-relaxed">
            Soluções completas de segurança eletrônica com manutenção e infra estrutura de ponta,
            instalação profissional e suporte contínuo — padrão de empresas de grande porte. Equipes
            constantemente em treinamentos.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 glow-red font-bold">
            <a href="#contato">
              Solicitar Orçamento <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.4)] aspect-[4/3]">
          <img
            src={imgSeguranca}
            alt="Equipe de campo da Espier Telecom e frota pronta para operações de segurança"
            loading="lazy"
            width={1280}
            height={832}
            className="w-full h-full object-cover"
          />
          <div className="img-overlay-dark opacity-75" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Equipe de campo</p>
            <p className="text-lg sm:text-xl font-extrabold mt-2">Prontidão técnica para instalações e atendimento</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {securityServices.map((s) => (
          <div
            key={s.title}
            className="group premium-card premium-card-hover p-5 sm:p-6"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mb-4 group-hover:from-primary group-hover:to-red-700 group-hover:border-primary group-hover:glow-red-soft transition-all">
              <s.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm sm:text-base font-bold mb-2 text-white">{s.title}</h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Security;
