import { Fingerprint, DoorOpen, CreditCard, Users, Clock, BarChart3, Smartphone } from "lucide-react";
import SecurityLanding from "@/components/security/SecurityLanding";
import imgAcesso from "@/assets/espier-recepcao-macae.png";
import imgAcessoEquip from "@/assets/acesso-equipamentos.jpg";
import imgAcessoAcess from "@/assets/acesso-acessorios.jpg";
import imgReception from "@/assets/espier-recepcao-petropolis.png";
import imgInstall from "@/assets/espier-campo-barra.png";

const ControleAcesso = () => (
  <main>
    <SecurityLanding
      eyebrow="Segurança Eletrônica"
      title="Controle de acesso "
      highlight={"\nsem fronteiras."}
      subtitle="Biometria, RFID e fechaduras eletrônicas integradas. Saiba quem entra, quando e onde — em tempo real."
      heroImage={imgAcesso}
...
      gallery={[
        { src: imgAcessoEquip, alt: "Equipamento em funcionamento", caption: "Leitor biométrico e facial em uso real em ambiente corporativo" },
        { src: imgAcessoAcess, alt: "Acessórios de controle", caption: "Biometria, RFID, fechaduras eletromagnéticas e teclados" },
        { src: imgReception, alt: "Recepção controlada", caption: "Unidade preparada para atendimento exclusivo e recepção profissional de clientes" },
        { src: imgInstall, alt: "Instalação técnica", caption: "Equipe Espier em campo executando instalações com organização e agilidade" },
      ]}
      faqs={[
        { q: "Qual a diferença entre biometria digital e facial?", a: "A digital lê a impressão do dedo (rápida e econômica). A facial reconhece o rosto (mais higiênica e moderna, ideal para alto fluxo). Ambas são extremamente seguras — recomendamos conforme o uso." },
        { q: "Funciona se eu esquecer o cartão ou estiver com a mão suja?", a: "Sim! Os sistemas modernos aceitam múltiplos meios: biometria, cartão RFID, senha numérica, QR Code e até credencial pelo celular (NFC). Você escolhe o que usar." },
        { q: "Posso liberar acesso para um visitante remotamente?", a: "Com certeza. Pelo aplicativo móvel você libera visitantes pontuais ou recorrentes, com janelas de horário pré-definidas e revogação automática." },
        { q: "Funciona se cair a energia?", a: "Sim. Instalamos fontes com bateria de backup (nobreak dedicado) que garantem operação por horas. Em caso extremo, há liberação manual segura definida em projeto." },
        { q: "Quantos usuários o sistema suporta?", a: "Os sistemas que utilizamos suportam de 100 a mais de 100.000 usuários, com gestão centralizada por software web — perfeito desde escritórios pequenos a grandes condomínios e indústrias." },
        { q: "Atende exigências da LGPD para dados biométricos?", a: "Sim. Trabalhamos com fabricantes que armazenam o template biométrico de forma criptografada (não a imagem real do dedo/rosto), em conformidade com a LGPD." },
        { q: "É integrado com câmeras e alarmes?", a: "Sim, oferecemos plataformas unificadas onde controle de acesso, CFTV e alarme operam juntos — com alertas cruzados e relatórios consolidados." },
      ]}
      ctaTitle="Quem entra, sai e quando — você decide."
      ctaSubtitle="Eleve a segurança e a produtividade do seu ambiente com um sistema de controle de acesso profissional."
      whatsappMessage="Olá! Quero um orçamento para sistema de Controle de Acesso."
    />
  </main>
);

export default ControleAcesso;
