import { Bell, ShieldCheck, Wifi, Smartphone, Radio, Siren, Bluetooth, Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SecurityLanding from "@/components/security/SecurityLanding";
import imgAlarmes from "@/assets/img-alarmes.jpg";

const Alarmes = () => (
  <>
    <Navbar />
    <main className="pt-16 lg:pt-20">
      <SecurityLanding
        eyebrow="Segurança Eletrônica"
        title="Alarmes que protegem"
        highlight="o que importa."
        subtitle="Sistemas de alarme inteligentes com monitoramento 24h, sensores de alta precisão e controle total pelo seu smartphone."
        heroImage={imgAlarmes}
        features={[
          { icon: Bell, title: "Centrais Monitoradas", desc: "Conexão direta com central de monitoramento 24h." },
          { icon: ShieldCheck, title: "Sensores de Precisão", desc: "Infravermelho, magnéticos e detectores de quebra." },
          { icon: Wifi, title: "Tecnologia Wireless", desc: "Instalação rápida e limpa, sem quebras na obra." },
          { icon: Smartphone, title: "App de Controle", desc: "Arme, desarme e receba alertas pelo celular." },
        ]}
        benefits={[
          { icon: Siren, title: "Resposta Imediata", desc: "Disparou? Você é notificado em segundos com vídeo e localização." },
          { icon: Activity, title: "Monitoramento 24h", desc: "Central recebe sinal e aciona equipe de pronta-resposta automaticamente." },
          { icon: Bluetooth, title: "Integração Smart", desc: "Conecte com CFTV, automação e assistentes virtuais (Alexa, Google)." },
        ]}
        services={[
          "Projeto e dimensionamento de sistemas de alarme",
          "Instalação de centrais cabeadas e wireless",
          "Sensores de movimento, abertura e quebra de vidro",
          "Sirenes externas e botões de pânico",
          "Configuração de monitoramento via app móvel",
          "Conexão com central de monitoramento 24h",
          "Integração com CFTV e controle de acesso",
          "Manutenção preventiva e corretiva especializada",
        ]}
        testimonials={[
          { name: "Eduardo Lima", role: "Proprietário — Joalheria Aurum", text: "Alarme integrado com CFTV salvou minha loja em duas tentativas de invasão. Profissionais excepcionais." },
          { name: "Patrícia Souza", role: "Moradora — Condomínio Atlanta", text: "Tranquilidade absoluta. Quando viajo, sei que minha casa está protegida." },
          { name: "Marcos Vinícius", role: "Diretor — Distribuidora MV", text: "Instalação rápida, suporte ágil. Já indiquei a Espier para vários parceiros." },
        ]}
        ctaTitle="Não espere o pior acontecer."
        ctaSubtitle="Invista em proteção real. Solicite agora um orçamento personalizado para sua casa ou empresa."
        whatsappMessage="Olá! Quero um orçamento para sistema de Alarme."
      />
    </main>
    <Footer />
    <WhatsAppButton />
  </>
);

export default Alarmes;
