import { Fingerprint, DoorOpen, CreditCard, Users, Clock, BarChart3, Smartphone } from "lucide-react";
import SecurityLanding from "@/components/security/SecurityLanding";
import imgAcesso from "@/assets/img-acesso.jpg";
import imgAcessoEquip from "@/assets/acesso-equipamentos.jpg";
import imgAcessoAcess from "@/assets/acesso-acessorios.jpg";
import imgReception from "@/assets/reception.png";
import imgInstall from "@/assets/installation.png";

const ControleAcesso = () => (
  <main>
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
      pros={[
        "Elimina o uso de chaves físicas — sem custo de cópia ou perda",
        "Histórico completo: quem entrou, quando e por onde",
        "Bloqueio instantâneo de credenciais perdidas ou desligamentos",
        "Integração com folha de ponto automatiza o RH",
        "Níveis de acesso por horário, setor e perfil de usuário",
        "Reduz fraudes e acesso não autorizado a áreas sensíveis",
        "Modernidade e profissionalismo na recepção do ambiente",
      ]}
      cons={[
        "Requer alimentação elétrica nas portas controladas",
        "Cadastro inicial de usuários demanda tempo de implantação",
        "Necessita treinamento básico de operadores e usuários",
        "Falhas elétricas exigem fonte redundante (nobreak / bateria)",
        "Investimento inicial maior que fechaduras convencionais",
      ]}
      gallery={[
        { src: imgAcessoEquip, alt: "Equipamento em funcionamento", caption: "Leitor biométrico e facial em uso real em ambiente corporativo" },
        { src: imgAcessoAcess, alt: "Acessórios de controle", caption: "Biometria, RFID, fechaduras eletromagnéticas e teclados" },
        { src: imgReception, alt: "Recepção controlada", caption: "Catracas e portarias automatizadas com gestão centralizada" },
        { src: imgInstall, alt: "Instalação técnica", caption: "Equipe Espier instalando sistema completo de controle" },
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
