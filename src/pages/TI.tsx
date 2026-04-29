import { Monitor, Server, CloudUpload, ShieldCheck, Network, TrendingUp, Award, Users, Clock } from "lucide-react";
import BannerLanding from "@/components/landing/BannerLanding";
import heroImg from "@/assets/ti-hero.jpg";

const TI = () => (
  <BannerLanding
    brand="SEGURANÇA • TI • TELECOM"
    titleTop="TI QUE"
    titleHighlight="IMPULSIONA"
    titleBottom="SEU NEGÓCIO."
    subtitle={
      <>
        Soluções de TI completas para{" "}
        <span className="text-primary font-bold">empresas, comércios e negócios</span>{" "}
        que não podem parar.
      </>
    }
    badgeTitle="TI ESTRATÉGICA"
    badgeText="Para resultados extraordinários."
    heroImage={heroImg}
    heroAlt="Especialista da Espier.Telecom monitorando infraestrutura de TI em data center"
    servicesEyebrow="Nossos serviços de TI"
    services={[
      { icon: Monitor, title: "Suporte Técnico", desc: "Atendimento rápido e especializado para o dia a dia da sua empresa." },
      { icon: Server, title: "Gestão de Infraestrutura", desc: "Soluções robustas para manter seus sistemas sempre disponíveis." },
      { icon: CloudUpload, title: "Backup e Recuperação", desc: "Proteção e recuperação de dados para garantir a continuidade." },
      { icon: ShieldCheck, title: "Segurança da Informação", desc: "Protegemos seus dados e sistemas contra ameaças e acessos indevidos." },
      { icon: Network, title: "Redes e Conectividade", desc: "Redes estáveis, seguras e de alta performance para seu negócio." },
      { icon: TrendingUp, title: "Consultoria em TI", desc: "Estratégias personalizadas para transformar a TI em vantagem competitiva." },
    ]}
    differentialEyebrow=""
    differentials={[
      { icon: ShieldCheck, title: "Soluções Personalizadas", desc: "Ideais para empresas, comércios e negócios de todos os portes." },
      { icon: Users, title: "Equipe Especializada", desc: "Profissionais experientes e certificados prontos para te atender." },
      { icon: Clock, title: "Foco no seu Negócio", desc: "Deixe a TI com a gente e foque no que realmente faz sua empresa crescer." },
    ]}
    whatsappMessage="Olá! Quero solicitar uma avaliação técnica de TI da Espier.Telecom."
    footerLine="Tecnologia que conecta, protege e faz sua empresa avançar."
  />
);

export default TI;
