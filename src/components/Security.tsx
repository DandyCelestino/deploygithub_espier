import { Camera, Wifi, Bell, Fingerprint, Zap, Cpu, Link2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  <section id="seguranca" className="py-20 lg:py-32 relative">
    <div className="absolute inset-0 grid-bg opacity-10" />
    <div className="section-container relative">
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <span className="text-sm font-mono text-primary uppercase tracking-widest">Segurança Eletrônica</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">
            Proteção <span className="gradient-text">total</span> para seu patrimônio
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Soluções completas de segurança eletrônica com tecnologia de ponta,
            instalação profissional e suporte contínuo.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 glow-red">
            <a href="#contato">
              Proteja seu negócio <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </div>
        <div className="rounded-2xl overflow-hidden border border-primary/20 relative aspect-video flex items-center justify-center bg-gradient-to-br from-card to-primary/5">
          <div className="grid-bg absolute inset-0 opacity-20" />
          <Camera className="w-24 h-24 text-primary/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {securityServices.map((s) => (
          <div
            key={s.title}
            className="group glass-card rounded-xl p-6 hover:border-primary/30 transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all">
              <s.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Security;
