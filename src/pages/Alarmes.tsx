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
      pros={[
        "Inibe invasões antes mesmo de qualquer tentativa",
        "Notificação instantânea no celular em caso de disparo",
        "Monitoramento 24h por central com pronta-resposta",
        "Tecnologia wireless: instalação limpa e rápida",
        "Pode reduzir significativamente o valor do seguro residencial",
        "Integração com CFTV traz vídeo do evento em tempo real",
        "Botão de pânico para emergências médicas e segurança",
      ]}
      cons={[
        "Falsos disparos podem ocorrer com instalação inadequada",
        "Sensores wireless dependem de troca periódica de bateria",
        "Cobertura depende do correto posicionamento dos sensores",
        "Monitoramento 24h por central tem mensalidade adicional",
        "Pets exigem sensores específicos (pet-immune) para evitar disparos",
      ]}
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
        { q: "A instalação quebra paredes?", a: "Não, na maioria dos casos. Trabalhamos com TI wireless que dispensa cabeamento — instalação limpa, rápida e sem sujeira na sua casa ou empresa." },
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
