import { Camera, Monitor, HardDrive, Wifi, Eye, Cloud, Cpu } from "lucide-react";
import SecurityLanding from "@/components/security/SecurityLanding";
import imgCftv from "@/assets/espier-frota-matriz.png";
import imgCftvEquip from "@/assets/cftv-equipamentos.jpg";
import imgCftvAcess from "@/assets/cftv-acessorios.jpg";
import imgInstall from "@/assets/espier-campo-barra.png";
import imgMonitoring from "@/assets/espier-tecnica-interna.png";

const CFTV = () => (
  <main>
    <SecurityLanding
      eyebrow="Segurança Eletrônica"
      title="CFTV inteligente para"
      highlight="proteção total."
      subtitle="Câmeras de alta definição, gravação 24/7 e acesso remoto pelo seu smartphone. Veja tudo, em qualquer lugar."
      heroImage={imgCftv}
...
      gallery={[
        { src: imgCftvEquip, alt: "Equipamentos em funcionamento", caption: "Centrais de monitoramento com câmeras IP 4K e NVR profissional" },
        { src: imgCftvAcess, alt: "Acessórios CFTV", caption: "Câmeras bullet, dome, cabos coaxiais, conectores BNC e suportes" },
        { src: imgMonitoring, alt: "Equipe técnica interna", caption: "Análise, configuração e recuperação técnica dos equipamentos de monitoramento" },
        { src: imgInstall, alt: "Equipe de campo", caption: "Equipe Espier em operação externa para instalação e suporte especializado" },
      ]}
      faqs={[
        { q: "Quantas câmeras eu preciso para minha casa ou empresa?", a: "Depende da metragem, pontos críticos e ângulos cegos. Nossa equipe faz uma visita técnica gratuita e dimensiona o projeto ideal — geralmente residências usam de 4 a 8 câmeras e empresas de 8 a 32." },
        { q: "Consigo ver as câmeras pelo celular?", a: "Sim! Todos os nossos sistemas oferecem aplicativo gratuito (iOS e Android) para visualização ao vivo, reprodução de gravações, alertas e controle remoto, de qualquer lugar do mundo com internet." },
        { q: "Por quanto tempo as imagens ficam gravadas?", a: "O padrão é de 30 dias em gravação contínua, mas isso é totalmente configurável conforme a capacidade do HD ou plano de nuvem contratado. Podemos ampliar para 60, 90 dias ou mais." },
        { q: "Funciona durante a noite ou sem iluminação?", a: "Sim. Trabalhamos com câmeras com visão noturna infravermelha (IR) que enxergam em total escuridão — alcance de 20 a 50 metros conforme o modelo, com imagem nítida em preto e branco." },
        { q: "Vocês oferecem contrato de manutenção?", a: "Sim, oferecemos planos mensais de manutenção preventiva e corretiva com SLA garantido, atendimento prioritário e visitas programadas. Garante longevidade e desempenho do sistema." },
        { q: "E se faltar energia ou internet?", a: "Instalamos nobreaks dedicados que mantêm o sistema funcionando por horas. A gravação local continua mesmo sem internet — quando ela volta, você acessa normalmente." },
        { q: "Posso integrar com alarme e controle de acesso?", a: "Com certeza! Trabalhamos com plataformas integradas onde câmeras, alarmes e controle de acesso operam em sinergia, com alertas cruzados e gestão única." },
      ]}
      ctaTitle="Monitore. Proteja. Tenha controle."
      ctaSubtitle="Solicite agora um orçamento profissional e descubra como um sistema CFTV pode transformar a segurança do seu negócio."
      whatsappMessage="Olá! Tenho interesse em um sistema CFTV. Pode me passar um orçamento?"
    />
  </main>
);

export default CFTV;
