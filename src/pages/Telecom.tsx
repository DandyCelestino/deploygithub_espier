import { Globe, Radio, PhoneCall, Cloud, Network, Headphones, ShieldCheck, TrendingUp, Handshake } from "lucide-react";
import BannerLanding from "@/components/landing/BannerLanding";
import heroImg from "@/assets/telecom-hero.jpg";

const Telecom = () => (
  <BannerLanding
    brand="TELECOM EMPRESARIAL"
    titleTop="CONECTIVIDADE"
    titleHighlight="QUE MOVE"
    titleBottom="O SEU NEGÓCIO."
    subtitle={
      <>
        Soluções de Telecom completas para{" "}
        <span className="text-primary font-bold">empresas, comércios e negócios</span>{" "}
        que precisam de conexão estável, segura e de alta performance.
      </>
    }
    badgeTitle="CONECTIVIDADE QUE IMPULSIONA."
    badgeText="Tecnologia que aproxima."
    heroImage={heroImg}
    heroAlt="Torre de telecomunicações com sinais conectando edifícios em uma cidade à noite"
    servicesEyebrow="Nossos serviços de Telecom"
    services={[
      { icon: Globe, title: "Internet Dedicada", desc: "Alta velocidade e estabilidade para o seu negócio não parar." },
      { icon: Radio, title: "Link Redundante", desc: "Redundância de link para garantir conexão contínua e máxima disponibilidade." },
      { icon: PhoneCall, title: "Telefonia VoIP", desc: "Comunicação inteligente com qualidade de voz e economia." },
      { icon: Cloud, title: "Interligação de Unidades", desc: "Conecte filiais e matrizes com segurança e alta performance." },
      { icon: Network, title: "Gestão de Rede", desc: "Monitoramento e suporte para sua rede sempre funcionando." },
      { icon: Headphones, title: "Suporte Especializado", desc: "Atendimento ágil e equipe pronta para garantir a melhor experiência." },
    ]}
    differentialEyebrow=""
    differentials={[
      { icon: ShieldCheck, title: "Conexão Estável", desc: "Mais desempenho e produtividade para o seu negócio." },
      { icon: TrendingUp, title: "Tecnologia de Ponta", desc: "Equipamentos modernos e infraestrutura de alta performance." },
      { icon: Handshake, title: "Parceria que Conecta", desc: "Soluções personalizadas e relacionamento de confiança." },
    ]}
    whatsappMessage="Olá! Quero solicitar uma avaliação técnica de Telecom da Espier.Telecom."
    footerLine="Conecta, acelera e transforma o seu negócio."
  />
);

export default Telecom;
