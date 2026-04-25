import { Fingerprint, DoorOpen, CreditCard, Users, Clock, BarChart3, Smartphone, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SecurityLanding from "@/components/security/SecurityLanding";
import imgAcesso from "@/assets/img-acesso.jpg";

const ControleAcesso = () => (
  <>
    <Navbar />
    <main className="pt-16 lg:pt-20">
      <SecurityLanding
        eyebrow="Segurança Eletrônica"
        title="Controle de acesso "
        highlight={"\nsem fronteiras."}
        subtitle="Biometria, RFID e fechaduras eletrônicas integradas. Saiba quem entra, quando e onde — em tempo real."
        heroImage={imgAcesso}
        features={[
          { icon: Fingerprint, title: "Biometria Avançada", desc: "Leitores digitais e faciais com altíssima precisão." },
          { icon: CreditCard, title: "Cartões RFID", desc: "Acesso rápido por proximidade, NFC e mobile credentials." },
          { icon: DoorOpen, title: "Fechaduras Eletrônicas", desc: "Senha, biometria, cartão ou comando remoto via app." },
          { icon: Users, title: "Gestão Centralizada", desc: "Software web para horários, permissões e auditoria." },
        ]}
        benefits={[
          { icon: Clock, title: "Controle de Jornada", desc: "Integração com folha de ponto e relatórios automáticos para o RH." },
          { icon: BarChart3, title: "Relatórios Inteligentes", desc: "Dashboards completos com histórico de acessos e auditoria de eventos." },
          { icon: Smartphone, title: "App Mobile", desc: "Abra portas, libere visitantes e gerencie acessos pelo celular." },
        ]}
        services={[
          "Projeto e dimensionamento de sistemas de controle de acesso",
          "Instalação de catracas, torniquetes e cancelas",
          "Fechaduras eletrônicas, biométricas e magnéticas",
          "Configuração de software de gestão e relatórios",
          "Integração com câmeras CFTV e alarmes",
          "Cadastro de usuários e definição de níveis de acesso",
          "Manutenção preventiva e corretiva",
          "Treinamento de operadores e suporte contínuo",
        ]}
        testimonials={[
          { name: "Mariana Costa", role: "Diretora de RH — Indústria Polar", text: "Substituímos 5 sistemas distintos por uma solução única. Eficiência multiplicada." },
          { name: "Felipe Andrade", role: "Síndico — Edifício Atlantis", text: "Controle por biometria facial. Os moradores adoraram a praticidade e segurança." },
          { name: "Juliana Reis", role: "Gerente Administrativa — Hospital VL", text: "Setores restritos protegidos com excelência. Time técnico Espier é nota 10." },
        ]}
        ctaTitle="Quem entra, sai e quando — você decide."
        ctaSubtitle="Eleve a segurança e a produtividade do seu ambiente com um sistema de controle de acesso profissional."
        whatsappMessage="Olá! Quero um orçamento para sistema de Controle de Acesso."
      />
    </main>
    <Footer />
    <WhatsAppButton />
  </>
);

export default ControleAcesso;
