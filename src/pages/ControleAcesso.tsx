import { Fingerprint, DoorOpen, CreditCard, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const features = [
  { icon: Fingerprint, title: "Biometria", desc: "Leitores biométricos para controle por impressão digital." },
  { icon: CreditCard, title: "Cartão de Proximidade", desc: "Sistemas com cartões RFID para acesso rápido e seguro." },
  { icon: DoorOpen, title: "Fechaduras Eletrônicas", desc: "Abertura por senha, biometria, cartão ou comando remoto." },
  { icon: Users, title: "Gestão de Acessos", desc: "Software para controlar horários, permissões e relatórios." },
];

const ControleAcesso = () => (
  <>
    <Navbar />
    <main className="pt-20 lg:pt-24">
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="section-container text-center relative">
          <span className="text-sm font-mono text-primary uppercase tracking-widest">Segurança Eletrônica</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">Controle de Acesso</h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Biometria, cartões de proximidade e fechaduras eletrônicas para máxima segurança.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="section-container">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Aplicações</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-transparent" />
        <div className="section-container relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Serviços Prestados</h2>
          <ul className="max-w-2xl mx-auto space-y-4 text-muted-foreground text-lg">
            {["Projeto e dimensionamento de controle de acesso", "Instalação de catracas e torniquetes", "Instalação de fechaduras eletrônicas e biométricas", "Configuração de software de gestão de acessos", "Manutenção preventiva e corretiva", "Integração com câmeras e alarmes"].map((item) => (
              <li key={item} className="flex items-start gap-3"><ArrowRight className="w-5 h-5 text-primary mt-1 shrink-0" /> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="section-container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Controle quem entra e sai</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Solicite um orçamento para um sistema moderno e seguro.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-red">
              <Link to="/#contato">Solicitar Orçamento <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-border/50 hover:border-primary/30">
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

export default ControleAcesso;
