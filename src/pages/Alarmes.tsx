import { Bell, ShieldCheck, Wifi, Smartphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import imgAlarmes from "@/assets/img-alarmes.jpg";

const features = [
  { icon: Bell, title: "Alarmes Monitorados", desc: "Sistemas com monitoramento 24h conectados a centrais de segurança." },
  { icon: ShieldCheck, title: "Sensores de Presença", desc: "Detectores infravermelhos de alta sensibilidade para áreas internas e externas." },
  { icon: Wifi, title: "Alarmes Sem Fio", desc: "Tecnologia wireless para instalação limpa e rápida." },
  { icon: Smartphone, title: "Controle via App", desc: "Arme e desarme seu sistema de qualquer lugar pelo smartphone." },
];

const Alarmes = () => (
  <>
    <Navbar />
    <main className="pt-16 lg:pt-20">
      {/* Hero da página com imagem */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={imgAlarmes}
            alt="Sistema de alarme corporativo profissional"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent" />
        </div>
        <div className="section-container relative py-16 sm:py-20">
          <span className="text-sm font-mono text-accent uppercase tracking-widest">Segurança Eletrônica</span>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mt-3 text-white max-w-3xl">
            Alarmes Residenciais e Comerciais
          </h1>
          <p className="mt-4 text-white/90 text-base sm:text-lg max-w-2xl">
            Proteja seu patrimônio com sistemas de alarme inteligentes, monitorados e integrados.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 glow-red">
            <Link to="/#contato">Solicitar Orçamento <ArrowRight className="w-5 h-5 ml-2" /></Link>
          </Button>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="section-container">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-12">Aplicações</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass-card rounded-xl p-4 sm:p-6 hover:border-primary/30 transition-all hover:-translate-y-1 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-all">
                  <f.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base">{f.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 relative bg-secondary/40">
        <div className="section-container relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Serviços Prestados</h2>
          <ul className="max-w-2xl mx-auto space-y-3 sm:space-y-4 text-muted-foreground text-base sm:text-lg">
            {["Projeto e dimensionamento de sistemas de alarme", "Instalação de centrais de alarme e sensores", "Configuração de monitoramento remoto via app", "Manutenção preventiva e corretiva", "Integração com câmeras e controle de acesso"].map((item) => (
              <li key={item} className="flex items-start gap-3"><ArrowRight className="w-5 h-5 text-accent mt-1 shrink-0" /> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="section-container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Proteja seu patrimônio agora</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Entre em contato e solicite um orçamento personalizado.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-red">
              <Link to="/#contato">Solicitar Orçamento <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-border hover:border-primary/30">
              <Link to="/">Voltar ao Início</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    <WhatsAppButton />
  </>
);

export default Alarmes;
