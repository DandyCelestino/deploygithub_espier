import { Bell, ShieldCheck, Wifi, Smartphone, Siren, Bluetooth, Activity } from "lucide-react";
import SecurityLanding from "@/components/security/SecurityLanding";
import imgAlarmes from "@/assets/espier-campo-barra.png";
import imgAlarmesEquip from "@/assets/alarmes-equipamentos.jpg";
import imgAlarmesAcess from "@/assets/alarmes-acessorios.jpg";
import imgMonitoring from "@/assets/espier-tecnica-interna.png";
import imgInstall from "@/assets/espier-frota-matriz.png";

const Alarmes = () => (
  <main>
    <SecurityLanding
      eyebrow="Segurança Eletrônica"
      title="Alarmes que protegem "
      highlight={"\no que importa."}
      subtitle="Sistemas de alarme inteligentes com monitoramento 24h, sensores de alta precisão e controle total pelo seu smartphone."
      heroImage={imgAlarmes}
...
      gallery={[
        { src: imgAlarmesEquip, alt: "Sistema em funcionamento", caption: "Central de alarme armada com sensores e controle por aplicativo" },
        { src: imgAlarmesAcess, alt: "Acessórios de alarme", caption: "Sensores PIR, magnéticos, sirenes, botões de pânico e controles" },
        { src: imgMonitoring, alt: "Suporte técnico interno", caption: "Manutenção e preparação técnica dos equipamentos de segurança" },
        { src: imgInstall, alt: "Base operacional", caption: "Estrutura e frota prontas para atendimento técnico e implantação rápida" },
      ]}
      faqs={[
        { q: "O alarme funciona se faltar energia ou internet?", a: "Sim. Nossas centrais possuem bateria de backup (autonomia de 12h a 24h) e módulo GPRS/4G que envia sinais à central de monitoramento mesmo sem internet via Wi-Fi." },
        { q: "Tenho animais de estimação. Vai disparar à toa?", a: "Não, se instalado corretamente. Usamos sensores 'pet-immune' que ignoram animais de até 25kg, ajustando ângulo e altura para evitar disparos falsos." },
        { q: "Como funciona o monitoramento 24h?", a: "Quando o alarme dispara, a central recebe o sinal em segundos. Operadores tentam contato imediato, validam o evento e acionam a equipe de pronta-resposta e/ou polícia conforme protocolo." },
        { q: "Consigo armar e desarmar pelo celular?", a: "Sim! Pelo aplicativo gratuito você arma, desarma, recebe notificações em tempo real e visualiza o histórico de eventos de qualquer lugar com internet." },
        { q: "Quantos sensores eu preciso?", a: "Depende do imóvel. Em média, residências usam de 4 a 10 sensores (portas, janelas e ambientes principais). Fazemos visita técnica gratuita para dimensionar a quantidade ideal." },
        { q: "A instalação quebra paredes?", a: "Não, na maioria dos casos. Trabalhamos com tecnologia wireless que dispensa cabeamento — instalação limpa, rápida e sem sujeira na sua casa ou empresa." },
        { q: "Posso integrar com câmeras de segurança?", a: "Sim. A integração entre alarme e CFTV é uma de nossas especialidades — quando o alarme dispara, você recebe a imagem ao vivo do local exato do evento." },
        { q: "Vocês oferecem contrato de manutenção?", a: "Sim. Temos planos de manutenção preventiva e corretiva com troca de baterias, testes periódicos e atendimento prioritário em caso de qualquer ocorrência." },
      ]}
      ctaTitle="Não espere o pior acontecer."
      ctaSubtitle="Invista em proteção real. Solicite agora um orçamento personalizado para sua casa ou empresa."
      whatsappMessage="Olá! Quero um orçamento para sistema de Alarme."
    />
  </main>
);

export default Alarmes;
