import { Fingerprint, DoorOpen, CreditCard, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const features = [
  { icon: Fingerprint, title: "Biometria", desc: "Leitores biométricos de alta precisão para controle de acesso por impressão digital em portas e catracas." },
  { icon: CreditCard, title: "Cartão de Proximidade", desc: "Sistemas com cartões RFID e tags de proximidade para acesso rápido e seguro a ambientes restritos." },
  { icon: DoorOpen, title: "Fechaduras Eletrônicas", desc: "Fechaduras inteligentes com abertura por senha, biometria, cartão ou comando remoto via aplicativo." },
  { icon: Users, title: "Gestão de Acessos", desc: "Software de gerenciamento para controlar horários, permissões e relatórios de entrada e saída." },
];

const ControleAcesso = () => (
  <>
    <Navbar />
    <main className="pt-20 lg:pt-24">
      {/* Hero */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="section-container text-center">
          <span className="text-sm font-mono text-primary uppercase tracking-widest">Segurança Eletrônica</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 text-card-foreground">
            Controle de Acesso
          </h1>
          <p className="mt-4 text-card-foreground/70 text-lg max-w-2xl mx-auto">
            Soluções completas de controle de acesso com biometria, cartões de proximidade e fechaduras eletrônicas para máxima segurança e praticidade.
          </p>
        </div>
      </section>

      {/* Aplicações */}
      <section className="py-20 lg:py-28">
        <div className="section-container">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Aplicações</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Ideal para empresas, condomínios, hospitais, escolas, academias e qualquer ambiente que necessite de controle rigoroso de entrada e saída de pessoas.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2 text-card-foreground">{f.title}</h3>
                <p className="text-sm text-card-foreground/70">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="section-container">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Serviços Prestados</h2>
          <ul className="max-w-2xl mx-auto space-y-4 text-muted-foreground text-lg mt-8">
            <li className="flex items-start gap-3"><ArrowRight className="w-5 h-5 text-primary mt-1 shrink-0" /> Projeto e dimensionamento de controle de acesso</li>
            <li className="flex items-start gap-3"><ArrowRight className="w-5 h-5 text-primary mt-1 shrink-0" /> Instalação de catracas e torniquetes</li>
            <li className="flex items-start gap-3"><ArrowRight className="w-5 h-5 text-primary mt-1 shrink-0" /> Instalação de fechaduras eletrônicas e biométricas</li>
            <li className="flex items-start gap-3"><ArrowRight className="w-5 h-5 text-primary mt-1 shrink-0" /> Configuração de software de gestão de acessos</li>
            <li className="flex items-start gap-3"><ArrowRight className="w-5 h-5 text-primary mt-1 shrink-0" /> Manutenção preventiva e corretiva</li>
            <li className="flex items-start gap-3"><ArrowRight className="w-5 h-5 text-primary mt-1 shrink-0" /> Integração com câmeras e alarmes</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="section-container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Controle quem entra e sai do seu ambiente</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Solicite um orçamento e implemente um sistema de controle de acesso moderno e seguro.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-red">
              <Link to="/#contato">Solicitar Orçamento <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
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
