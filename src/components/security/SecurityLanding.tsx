import { ArrowRight, MessageCircle, Phone, Globe, MapPin, CheckCircle2, Wrench, Package, Settings, FileText, Star, Quote, Shield, ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface SecurityFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface SecurityLandingProps {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  heroImage: string;
  features: SecurityFeature[];
  services: string[];
  benefits: { icon: LucideIcon; title: string; desc: string }[];
  testimonials: { name: string; role: string; text: string }[];
  pros: string[];
  cons: string[];
  gallery: GalleryItem[];
  faqs: FaqItem[];
  ctaTitle: string;
  ctaSubtitle: string;
  whatsappMessage: string;
}

const PHONE = "5521960001439";
const SITE = "espier.com.br";

const SecurityLanding = ({
  eyebrow,
  title,
  highlight,
  subtitle,
  heroImage,
  features,
  services,
  benefits,
  testimonials,
  pros,
  cons,
  gallery,
  faqs,
  ctaTitle,
  ctaSubtitle,
  whatsappMessage,
}: SecurityLandingProps) => {
  const waLink = `https://wa.me/${PHONE}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="bg-background text-white">
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={title}
            width={1920}
            height={1080}
            className="w-full h-full object-cover scale-105 opacity-70"
          />
          {/* Gradientes Espier */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-accent/20" />
          {/* Glow radial */}
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-primary/30 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/20 blur-[120px]" />
        </div>

        <div className="section-container relative z-10 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo / brand */}
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center glow-red">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Espier<span className="text-primary">.</span>Telecom
              </span>
            </Link>

            <span className="inline-block text-xs sm:text-sm font-mono text-accent uppercase tracking-[0.3em] mb-6 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5">
              {eyebrow}
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white opacity-100">
              {title}{" "}
              <span className="bg-gradient-to-r from-primary via-red-500 to-accent bg-clip-text text-transparent text-4xl whitespace-pre-line">
                {highlight}
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>

            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 glow-red text-base h-12 px-8">
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" /> Contratar via WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white text-base h-12 px-8 backdrop-blur">
                <Link to="/#contato">
                  Solicitar Orçamento <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Trust strip */}
            <div className="mt-14 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { v: "15+", l: "Anos" },
                { v: "5000+", l: "Clientes" },
                { v: "24/7", l: "Suporte" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                    {s.v}
                  </div>
                  <div className="text-xs sm:text-sm text-white/60 uppercase tracking-wider mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs uppercase tracking-widest animate-pulse">
          Role para baixo ↓
        </div>
      </section>

      {/* FEATURES — estilo Apple cards */}
      <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background via-[hsl(0_0%_6%)] to-background">
        <div className="absolute inset-0 grid-bg opacity-[0.03]" />
        <div className="section-container relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono text-accent uppercase tracking-[0.3em]">Tecnologia</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 tracking-tight">
              Recursos que fazem a{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                diferença
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl p-5 sm:p-7 bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur hover:border-primary/40 transition-all hover:-translate-y-1"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center mb-4 glow-red">
                    <f.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-2 text-white">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O QUE OFERECEMOS — Contratos / Equipamentos / Instalação / Manutenção */}
      <section className="py-20 lg:py-32 relative bg-slate-700">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="section-container relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono text-accent uppercase tracking-[0.3em]">Soluções completas</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 tracking-tight">
              Tudo o que você precisa,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                em um só lugar
              </span>
            </h2>
            <p className="mt-4 text-white/60">Da consultoria à manutenção contínua, com profissionais certificados.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { icon: FileText, title: "Contratos de Manutenção", desc: "Planos mensais com SLA garantido e atendimento prioritário." },
              { icon: Wrench, title: "Manutenção Técnica", desc: "Preventiva e corretiva por equipe certificada." },
              { icon: Package, title: "Fornecimento de Equipamentos", desc: "Marcas líderes com garantia e melhor custo-benefício." },
              { icon: Settings, title: "Instalações Profissionais", desc: "Projeto, execução e comissionamento completos." },
            ].map((b) => (
              <div key={b.title} className="rounded-2xl p-5 sm:p-7 bg-gradient-to-b from-primary/[0.08] to-transparent border border-primary/20 hover:border-primary/50 transition-all">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2 text-white">{b.title}</h3>
                <p className="text-xs sm:text-sm text-white/60">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS PERSONALIZADOS */}
      {benefits.length > 0 && (
        <section className="py-20 lg:py-32 relative bg-gradient-to-b from-background via-[hsl(0_0%_6%)] to-background">
          <div className="section-container">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono text-accent uppercase tracking-[0.3em]">Por que Espier</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 tracking-tight text-white">
                Excelência em cada detalhe
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((b) => (
                <div key={b.title} className="rounded-2xl p-7 bg-white/[0.03] border border-white/10 hover:border-accent/40 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center mb-4 glow-green">
                    <b.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">{b.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SERVIÇOS PRESTADOS — checklist */}
      <section className="py-20 lg:py-32 relative bg-slate-700">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-mono text-accent uppercase tracking-[0.3em]">Serviços prestados</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 tracking-tight text-white">
                Atendimento{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  end-to-end
                </span>
              </h2>
              <p className="mt-4 text-white/60 leading-relaxed">
                Conduzimos cada projeto com metodologia clara: levantamento, projeto, implantação e manutenção contínua.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="bg-primary hover:bg-primary/90 text-white glow-red">
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" /> Falar no WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <Link to="/#contato">Pedir orçamento <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </div>
            </div>

            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s} className="flex items-start gap-3 rounded-xl p-4 bg-white/[0.03] border border-white/10 hover:border-accent/30 hover:bg-white/[0.05] transition-all">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-white/85">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background via-[hsl(0_0%_6%)] to-background">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] -translate-y-1/2 rounded-full bg-accent/10 blur-[140px]" />
        <div className="section-container relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono text-accent uppercase tracking-[0.3em]">Depoimentos</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 tracking-tight text-white">
              Quem confia, recomenda
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="relative rounded-2xl p-7 bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 backdrop-blur">
                <Quote className="absolute top-5 right-5 w-8 h-8 text-primary/40" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-white/80 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="pt-4 border-t border-white/10">
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-sm text-white/50">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA — Equipamentos em funcionamento e acessórios */}
      {gallery.length > 0 && (
        <section className="py-20 lg:py-32 relative bg-slate-700 overflow-hidden">
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[140px]" />
          <div className="section-container relative">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono text-accent uppercase tracking-[0.3em]">Equipamentos & Acessórios</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 tracking-tight text-white">
                Tecnologia de ponta{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  em ação
                </span>
              </h2>
              <p className="mt-4 text-white/60">Conheça os equipamentos e acessórios que utilizamos em nossos projetos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {gallery.map((g) => (
                <figure key={g.alt} className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-primary/40 transition-all">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={g.src}
                      alt={g.alt}
                      loading="lazy"
                      width={1280}
                      height={832}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                  <figcaption className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <p className="text-xs font-mono text-accent uppercase tracking-[0.25em] mb-1">{g.alt}</p>
                    <p className="text-white font-bold text-base sm:text-lg leading-snug">{g.caption}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VANTAGENS / DESVANTAGENS */}
      {(pros.length > 0 || cons.length > 0) && (
        <section className="py-20 lg:py-32 relative bg-gradient-to-b from-background via-[hsl(0_0%_6%)] to-background">
          <div className="section-container">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono text-accent uppercase tracking-[0.3em]">Análise honesta</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 tracking-tight text-white">
                Vantagens &{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  desvantagens
                </span>
              </h2>
              <p className="mt-4 text-white/60">Decida com clareza. Mostramos o que ganhar — e o que considerar.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Vantagens */}
              <div className="rounded-2xl p-7 sm:p-8 bg-gradient-to-b from-accent/10 to-transparent border border-accent/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center glow-green">
                    <ThumbsUp className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">Vantagens</h3>
                </div>
                <ul className="space-y-3">
                  {pros.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-white/85 leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desvantagens / Pontos de atenção */}
              <div className="rounded-2xl p-7 sm:p-8 bg-gradient-to-b from-primary/10 to-transparent border border-primary/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-red">
                    <ThumbsDown className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">Pontos de atenção</h3>
                </div>
                <ul className="space-y-3">
                  {cons.map((c) => (
                    <li key={c} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full border-2 border-primary/60 shrink-0 mt-0.5 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      </span>
                      <span className="text-white/85 leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-xs text-white/50 italic">
                  Nossa equipe te orienta para mitigar cada um destes pontos com a solução ideal.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-20 lg:py-32 relative bg-slate-700">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-accent/10 blur-[120px]" />
          <div className="section-container relative">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono text-accent uppercase tracking-[0.3em]">Dúvidas frequentes</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 tracking-tight text-white">
                Perguntas{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  frequentes
                </span>
              </h2>
              <p className="mt-4 text-white/60">As respostas que nossos clientes mais buscam antes de contratar.</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((f, i) => (
                  <AccordionItem
                    key={f.q}
                    value={`item-${i}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 sm:px-6 hover:border-accent/30 transition-colors"
                  >
                    <AccordionTrigger className="text-left text-white font-semibold hover:no-underline py-5 gap-4">
                      <span className="flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <span>{f.q}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-white/70 leading-relaxed pl-8 pr-2 pb-5">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="mt-12 text-center">
              <p className="text-white/60 mb-4">Não encontrou sua dúvida? Fale agora mesmo conosco.</p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white glow-red">
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" /> Falar com especialista
                </a>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-red-700 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="section-container relative text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-[1.05] sm:text-6xl">
            {ctaTitle}
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-white/85 max-w-2xl mx-auto">{ctaSubtitle}</p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-base h-13 px-8 font-bold">
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" /> Contratar agora
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white text-base h-13 px-8 backdrop-blur">
              <Link to="/#contato">
                Solicitar orçamento <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Contatos rápidos */}
          <div className="mt-14 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="rounded-xl p-5 bg-white/10 border border-white/20 hover:bg-white/15 transition-all backdrop-blur">
              <Phone className="w-5 h-5 text-white mx-auto mb-2" />
              <p className="text-xs text-white/70 uppercase tracking-wider">WhatsApp</p>
              <p className="font-bold text-white">(21) 96000-1439</p>
            </a>
            <a href={`https://${SITE}`} target="_blank" rel="noopener noreferrer" className="rounded-xl p-5 bg-white/10 border border-white/20 hover:bg-white/15 transition-all backdrop-blur">
              <Globe className="w-5 h-5 text-white mx-auto mb-2" />
              <p className="text-xs text-white/70 uppercase tracking-wider">Site</p>
              <p className="font-bold text-white">{SITE}</p>
            </a>
            <div className="rounded-xl p-5 bg-white/10 border border-white/20 backdrop-blur">
              <MapPin className="w-5 h-5 text-white mx-auto mb-2" />
              <p className="text-xs text-white/70 uppercase tracking-wider">Atendimento</p>
              <p className="font-bold text-white text-sm">Região serrana, região dos lagos, Rio e Grande Rio, Região da costa verde.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecurityLanding;
