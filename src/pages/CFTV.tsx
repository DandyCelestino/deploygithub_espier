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
      pros={[
        "Inibição comprovada de furtos, vandalismo e invasões",
        "Imagens em 4K com visão noturna até 50 metros",
        "Acesso remoto ao vivo pelo celular, tablet ou PC",
        "Gravação contínua 24/7 com backup em nuvem",
        "Detecção inteligente por IA reduz alarmes falsos",
        "Auditoria completa de eventos para uso jurídico",
        "Valoriza o imóvel e reduz custo do seguro",
      ]}
      cons={[
        "Requer infraestrutura de cabeamento (estruturado ou wireless)",
        "Investimento inicial proporcional ao número de câmeras",
        "Necessidade de manutenção periódica para garantir qualidade",
        "Armazenamento em nuvem pode ter custo mensal recorrente",
        "Privacidade exige posicionamento técnico adequado das câmeras",
      ]}
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
