import { Camera, Monitor, HardDrive, Wifi, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import imgCftv from "@/assets/img-cftv.jpg";

const features = [
  { icon: Camera, title: "Câmeras IP e Analógicas", desc: "Alta resolução com visão noturna e detecção de movimento." },
  { icon: Monitor, title: "Monitoramento em Tempo Real", desc: "Acompanhe todas as câmeras por monitores ou dispositivos móveis." },
  { icon: HardDrive, title: "Gravação e Armazenamento", desc: "DVRs e NVRs de alta capacidade com backup em nuvem." },
  { icon: Wifi, title: "Acesso Remoto", desc: "Visualize de qualquer lugar pelo smartphone ou computador." },
];

const CFTV = () => (
  <>
    <Navbar />
    <main className="pt-16 lg:pt-20">
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={imgCftv}
            alt="Câmera CFTV PTZ profissional em fachada corporativa"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent" />
        </div>
        <div className="section-container relative py-16 sm:py-20">
          <span className="text-sm font-mono text-accent uppercase tracking-widest">Segurança Eletrônica</span>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mt-3 text-white max-w-3xl">CFTV — Circuito Fechado de TV</h1>
          <p className="mt-4 text-white/90 text-base sm:text-lg max-w-2xl">
            Videomonitoramento com câmeras de alta definição, gravação contínua e acesso remoto.
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
            {["Projeto e dimensionamento de sistemas CFTV", "Instalação de câmeras IP e analógicas", "Configuração de DVR/NVR e armazenamento em nuvem", "Configuração de acesso remoto via app", "Manutenção preventiva e corretiva", "Integração com alarmes e controle de acesso"].map((item) => (
              <li key={item} className="flex items-start gap-3"><ArrowRight className="w-5 h-5 text-accent mt-1 shrink-0" /> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="section-container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Monitore seu patrimônio com tecnologia</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Solicite um orçamento para um sistema CFTV profissional.</p>
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

export default CFTV;
