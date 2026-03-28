import { Camera, Wifi, Bell, Fingerprint, Zap, Cpu, Link2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import securityImg from "@/assets/installation.png";

const securityServices = [
  { icon: Camera, title: "CFTV — Câmeras de Segurança", desc: "Instalação de câmeras IP, analógicas e sistemas completos de monitoramento com acesso remoto via smartphone." },
  { icon: Wifi, title: "Monitoramento Remoto", desc: "Acompanhe suas câmeras e alarmes em tempo real de qualquer lugar do mundo, 24 horas por dia." },
  { icon: Bell, title: "Alarmes Residenciais e Comerciais", desc: "Sistemas de alarme com sensores de presença, abertura e sirenes integradas." },
  { icon: Fingerprint, title: "Controle de Acesso", desc: "Catracas, fechaduras eletrônicas, biometria e cartões de proximidade para controle total." },
  { icon: Zap, title: "Cercas Elétricas", desc: "Instalação e manutenção de cercas elétricas com central de choque monitorada." },
  { icon: Cpu, title: "Automação de Segurança", desc: "Automatize portões, iluminação e sistemas de segurança com controle centralizado." },
  { icon: Link2, title: "Integração Inteligente", desc: "Conecte câmeras, alarmes e controle de acesso em um único sistema inteligente e centralizado." },
];

const Security = () => (
  <section id="seguranca" className="py-20 lg:py-32">
    <div className="section-container">
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <span className="text-sm font-mono text-primary uppercase tracking-widest">Segurança Eletrônica</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">
            Proteção <span className="text-primary">total</span> para seu patrimônio
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Soluções completas de segurança eletrônica com tecnologia de ponta,
            instalação profissional e suporte contínuo.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 glow-red">
            <a href="#contato">
              Proteja seu negócio <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </div>
        <div className="rounded-xl overflow-hidden border border-border">
          <img src={securityImg} alt="Sistema de segurança" className="w-full h-80 object-cover" loading="lazy" width={1280} height={720} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {securityServices.map((s) => (
          <div
            key={s.title}
            className="group bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <s.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Security;
