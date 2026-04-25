import { Camera, Monitor, HardDrive, Wifi, Eye, Cloud, ShieldCheck, Cpu } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SecurityLanding from "@/components/security/SecurityLanding";
import imgCftv from "@/assets/img-cftv.jpg";

const CFTV = () => (
  <>
    <Navbar />
    <main className="pt-16 lg:pt-20">
      <SecurityLanding
        eyebrow="Segurança Eletrônica"
        title="CFTV inteligente para"
        highlight="proteção total."
        subtitle="Câmeras de alta definição, gravação 24/7 e acesso remoto pelo seu smartphone. Veja tudo, em qualquer lugar."
        heroImage={imgCftv}
        features={[
          { icon: Camera, title: "Câmeras IP 4K", desc: "Alta resolução com visão noturna IR e detecção inteligente." },
          { icon: Monitor, title: "Monitoramento Real-time", desc: "Visualização em monitores e dispositivos móveis." },
          { icon: HardDrive, title: "Gravação Robusta", desc: "DVR/NVR com armazenamento local e backup em nuvem." },
          { icon: Wifi, title: "Acesso Remoto", desc: "Veja suas câmeras de qualquer lugar do mundo." },
        ]}
        benefits={[
          { icon: Eye, title: "Análise por IA", desc: "Detecção de pessoas, veículos e comportamentos suspeitos com alertas instantâneos." },
          { icon: Cloud, title: "Cloud Storage", desc: "Backup automático em nuvem para você nunca perder uma gravação importante." },
          { icon: Cpu, title: "Integração Total", desc: "Integre com alarmes, controle de acesso e automação predial em uma única plataforma." },
        ]}
        services={[
          "Projeto e dimensionamento profissional de sistemas CFTV",
          "Instalação de câmeras IP, analógicas e HD-CVI",
          "Configuração de DVR, NVR e armazenamento em nuvem",
          "Configuração de acesso remoto via aplicativo",
          "Manutenção preventiva e corretiva especializada",
          "Integração com alarmes e sistemas de controle de acesso",
          "Análise de imagens com inteligência artificial",
          "Suporte técnico 24/7 para clientes contratuais",
        ]}
        testimonials={[
          { name: "Carlos Mendes", role: "Diretor — Logística JCM", text: "Instalaram 32 câmeras em nosso galpão. Qualidade impecável e suporte sempre rápido." },
          { name: "Ana Beatriz", role: "Gerente — Condomínio Vista Mar", text: "Sistema completo entregue no prazo. Recomendo a Espier de olhos fechados." },
          { name: "Roberto Silva", role: "Proprietário — Rede de Postos", text: "Há 6 anos com contrato de manutenção. Profissionalismo é a palavra." },
        ]}
        ctaTitle="Monitore. Proteja. Tenha controle."
        ctaSubtitle="Solicite agora um orçamento profissional e descubra como um sistema CFTV pode transformar a segurança do seu negócio."
        whatsappMessage="Olá! Tenho interesse em um sistema CFTV. Pode me passar um orçamento?"
      />
    </main>
    <Footer />
    <WhatsAppButton />
  </>
);

export default CFTV;
