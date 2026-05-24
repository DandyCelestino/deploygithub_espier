import { useState } from "react";
import { Camera, ShieldCheck, Wrench } from "lucide-react";
import imgPanoramica from "@/assets/galeria/operacao-condominio-panoramica.jpg";
import imgCftvCarro from "@/assets/galeria/cftv-instalacao-carro.jpg";
import imgAlarmeCarro from "@/assets/galeria/alarme-instalacao-carro.jpg";
import imgRackJanela from "@/assets/galeria/rack-servidor-janela.jpg";
import imgRackNetwork from "@/assets/galeria/rack-network.jpg";
import imgControleAcesso from "@/assets/galeria/controle-acesso-portao.jpg";
import imgMotorPortao from "@/assets/galeria/motor-portao.jpg";
import imgCftvDupla from "@/assets/galeria/cftv-dupla-tecnicos.jpg";
import GaleriaLightbox, { type GaleriaItem } from "./GaleriaLightbox";

const items: GaleriaItem[] = [
  {
    img: imgPanoramica,
    title: "Operação completa em condomínios",
    caption:
      "Equipe uniformizada, frota identificada e múltiplas frentes simultâneas — CFTV, controle de acesso e cabeamento, executados no mesmo dia.",
    tag: "Projeto integrado",
  },
  {
    img: imgCftvCarro,
    title: "Instalação de CFTV profissional",
    caption: "Câmeras de alta resolução posicionadas com precisão técnica.",
    tag: "Segurança Eletrônica",
  },
  {
    img: imgRackJanela,
    title: "Cabeamento estruturado",
    caption: "Racks organizados, identificados e documentados.",
    tag: "Infraestrutura TI",
  },
  {
    img: imgControleAcesso,
    title: "Controle de acesso",
    caption: "Teclados, biometria e tags para portarias inteligentes.",
    tag: "Acesso",
  },
  {
    img: imgAlarmeCarro,
    title: "Alarmes monitorados",
    caption: "Sensores de presença e centrais com resposta 24/7.",
    tag: "Alarme",
  },
  {
    img: imgRackNetwork,
    title: "Data centers e redes",
    caption: "Switches, patch panels e fibra com padrão corporativo.",
    tag: "Redes",
  },
  {
    img: imgMotorPortao,
    title: "Automação de portões",
    caption: "Motores instalados com garantia e manutenção preventiva.",
    tag: "Automação",
  },
  {
    img: imgCftvDupla,
    title: "Equipe técnica certificada",
    caption: "Profissionais treinados, uniformizados e identificados.",
    tag: "Time Espier",
  },
];

const EspierEmAcao = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goToPrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));

  const goToNext = () =>
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));

  const goTo = (index: number) => setCurrentIndex(index);

  // Grid span mapping (index -> tailwind classes)
  const spans = [
    "md:col-span-2 md:row-span-2",
    "",
    "",
    "md:col-span-2",
    "",
    "",
    "",
    "",
  ];

  return (
    <>
      <section
        id="em-acao"
        className="py-20 lg:py-32 bg-background relative overflow-hidden"
      >
        {/* Glow decorativo */}
        <div className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[140px] pointer-events-none" />

        <div className="section-container relative">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <span className="eyebrow eyebrow-line">Galeria</span>
            <h2 className="h-section mt-5">
              Espier.Telecom <span className="gradient-text">em ação</span>
            </h2>
            <p className="mt-4 text-lg sm:text-xl font-semibold text-foreground/90">
              Conectando você ao que importa — com técnica, presença e
              excelência.
            </p>
            <p className="mt-3 text-muted-foreground text-base sm:text-lg leading-relaxed">
              Veja de perto a rotina dos nossos times: projetos executados com
              padrão corporativo, equipe identificada, frota própria e
              tecnologia de ponta atendendo condomínios, empresas e
              residências de alto padrão.
            </p>

            {/* Trust strip */}
            <div className="mt-7 flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" /> Equipe
                uniformizada
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="inline-flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-primary" /> Frota própria
                identificada
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="inline-flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-primary" /> Obras documentadas
              </span>
            </div>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-[200px] sm:auto-rows-[220px] lg:auto-rows-[240px] gap-4">
            {items.map((it, i) => (
              <figure
                key={i}
                onClick={() => openLightbox(i)}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-[0_25px_60px_-20px_hsl(0_80%_50%/0.35)] hover:border-primary/40 transition-all duration-500 cursor-pointer ${spans[i] ?? ""}`}
              >
                <img
                  src={it.img}
                  alt={it.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-[1200ms]"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                {/* Tag */}
                <span className="absolute top-3 left-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/95 text-primary-foreground backdrop-blur-sm">
                  {it.tag}
                </span>

                {/* Caption */}
                <figcaption className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <h3 className="text-white font-extrabold text-base sm:text-lg leading-tight drop-shadow">
                    {it.title}
                  </h3>
                  <p className="text-white/85 text-xs sm:text-sm mt-1 leading-snug line-clamp-2 group-hover:line-clamp-none transition-all">
                    {it.caption}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm sm:text-base">
              Quer o mesmo padrão na sua empresa, condomínio ou residência?
            </p>
            <a
              href="#contato"
              className="inline-flex items-center gap-2 mt-4 px-7 h-12 rounded-md bg-primary text-primary-foreground font-bold glow-red hover:bg-primary/90 transition-colors"
            >
              Solicitar visita técnica gratuita
            </a>
          </div>
        </div>
      </section>

      <GaleriaLightbox
        items={items}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onPrev={goToPrev}
        onNext={goToNext}
        onGoTo={goTo}
      />
    </>
  );
};

export default EspierEmAcao;
