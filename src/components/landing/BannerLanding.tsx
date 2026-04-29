import { ArrowRight, MessageCircle, Phone, Mail, MapPin, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export interface BannerLandingProps {
  brand: string; // "TI" | "TELECOM EMPRESARIAL"
  titleTop: string; // ex: "TI QUE"
  titleHighlight: string; // ex: "IMPULSIONA"
  titleBottom: string; // ex: "SEU NEGÓCIO."
  subtitle: React.ReactNode;
  badgeTitle: string; // ex: "TI ESTRATÉGICA"
  badgeText: string;
  heroImage: string;
  heroAlt: string;
  servicesEyebrow: string; // ex: "NOSSOS SERVIÇOS DE TI"
  services: { icon: LucideIcon; title: string; desc: string }[];
  differentialEyebrow: string;
  differentials: { icon: LucideIcon; title: string; desc: string }[];
  whatsappMessage: string;
  footerLine: string;
}

const WHATSAPP_NUMBER = "5521960001439";
const PHONE_DISPLAY = "(21) 96000-1439";
const EMAIL = "espier.telecom@gmail.com";

const BannerLanding = ({
  brand,
  titleTop,
  titleHighlight,
  titleBottom,
  subtitle,
  badgeTitle,
  badgeText,
  heroImage,
  heroAlt,
  servicesEyebrow,
  services,
  differentialEyebrow,
  differentials,
  whatsappMessage,
  footerLine,
}: BannerLandingProps) => {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-primary selection:text-white">
      {/* Topo discreto - apenas logo + voltar (sem menu de navegação) */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Shield className="w-7 h-7 text-primary group-hover:drop-shadow-[0_0_10px_hsl(0_80%_48%/0.7)] transition-all" />
          <span className="text-lg font-extrabold tracking-tight text-white">
            Espier.<span className="text-primary">Telecom</span>
          </span>
        </Link>
        <Link
          to="/"
          className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors underline-offset-4 hover:underline"
        >
          ← Voltar ao site
        </Link>
      </header>

      {/* HERO — replica o banner */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20">
        {/* Fundo */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={heroAlt}
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
          {/* Faixas vermelhas decorativas dos cantos */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-primary/80 to-transparent" style={{ clipPath: "polygon(0 0, 60% 0, 0 60%)" }} />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/70 to-transparent" style={{ clipPath: "polygon(40% 0, 100% 0, 100% 60%)" }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/60 to-transparent" style={{ clipPath: "polygon(0 100%, 0 40%, 60% 100%)" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
          {/* Logo + selo */}
          <div className="flex items-center gap-3 mb-10">
            <Shield className="w-12 h-12 sm:w-14 sm:h-14 text-primary drop-shadow-[0_0_18px_hsl(0_80%_48%/0.5)]" />
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Espier.<span className="text-primary">Telecom</span>
              </div>
              <div className="text-[10px] sm:text-xs tracking-[0.35em] text-white/70 mt-0.5">{brand}</div>
            </div>
          </div>

          {/* Título massivo */}
          <h1 className="font-heading font-black uppercase leading-[0.95] tracking-tight">
            <span className="block text-5xl sm:text-7xl lg:text-8xl text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {titleTop}
            </span>
            <span className="block text-5xl sm:text-7xl lg:text-8xl text-primary drop-shadow-[0_4px_12px_rgba(220,38,38,0.4)]">
              {titleHighlight}
            </span>
            <span className="block text-4xl sm:text-6xl lg:text-7xl text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {titleBottom}
            </span>
          </h1>

          {/* Subtítulo + badge */}
          <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-8 items-end">
            <p className="text-base sm:text-lg text-white/85 max-w-xl leading-relaxed">{subtitle}</p>

            <div className="rounded-2xl border border-white/15 bg-black/60 backdrop-blur-md px-5 py-4 max-w-xs shadow-[0_0_30px_rgba(220,38,38,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-primary/40 flex items-center justify-center text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-wider text-white">{badgeTitle}</div>
                  <div className="text-[11px] font-semibold tracking-wider text-primary uppercase mt-0.5 leading-tight">
                    {badgeText}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="relative py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <h2 className="text-sm sm:text-base font-bold tracking-[0.3em] text-white uppercase">
              {servicesEyebrow}
            </h2>
            <div className="mx-auto mt-3 w-20 h-[2px] bg-primary" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="group text-center px-2 py-4 transition-transform hover:-translate-y-1"
                >
                  <div className="mx-auto mb-4 w-14 h-14 flex items-center justify-center text-primary group-hover:drop-shadow-[0_0_14px_hsl(0_80%_48%/0.7)] transition-all">
                    <Icon className="w-12 h-12" strokeWidth={1.6} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-white leading-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[11px] sm:text-xs text-white/65 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA WhatsApp — replicando faixa do banner */}
      <section className="relative py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="block group"
          >
            <div className="relative rounded-full overflow-hidden border border-white/10 bg-black flex items-center hover:scale-[1.01] transition-transform shadow-[0_8px_30px_rgba(220,38,38,0.25)]">
              {/* WhatsApp circle */}
              <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 ml-1 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30">
                <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>

              {/* Red section */}
              <div className="flex-1 bg-primary px-4 sm:px-8 py-4 sm:py-6">
                <div className="text-sm sm:text-2xl font-black uppercase italic text-white leading-tight">
                  Fale agora com<br className="sm:hidden" /> um especialista!
                </div>
              </div>

              {/* White section */}
              <div className="hidden md:flex items-center gap-3 bg-white px-6 py-6 rounded-r-full">
                <ArrowRight className="w-7 h-7 text-primary" strokeWidth={3} />
                <div>
                  <div className="text-sm font-black uppercase italic text-black leading-tight">
                    Atendimento rápido
                  </div>
                  <div className="text-sm font-black uppercase italic text-primary leading-tight">
                    e sem compromisso!
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="relative py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          {differentialEyebrow && (
            <div className="text-center mb-10">
              <h2 className="text-sm font-bold tracking-[0.3em] text-white/70 uppercase">
                {differentialEyebrow}
              </h2>
            </div>
          )}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6 sm:p-10">
            <div className="grid md:grid-cols-3 gap-8">
              {differentials.map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.title} className="flex gap-4">
                    <div className="shrink-0 w-14 h-14 rounded-xl border border-primary/30 flex items-center justify-center text-primary">
                      <Icon className="w-7 h-7" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold uppercase italic text-white tracking-wide">
                        {d.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/70 leading-relaxed">{d.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO DE AVALIAÇÃO */}
      <section id="avaliacao" className="relative py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sem compromisso
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black uppercase text-white leading-tight">
              Solicitar <span className="text-primary">avaliação técnica</span>
            </h2>
            <p className="mt-3 text-white/65 text-sm">
              Preencha os dados abaixo. Nossa equipe entra em contato em até 24h úteis.
            </p>
          </div>

          <form
            action={`https://wa.me/${WHATSAPP_NUMBER}`}
            method="get"
            target="_blank"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget;
              const fd = new FormData(f);
              const msg =
                `Olá! Quero solicitar uma avaliação técnica.%0A` +
                `*Nome:* ${fd.get("nome")}%0A` +
                `*Empresa:* ${fd.get("empresa")}%0A` +
                `*Telefone:* ${fd.get("telefone")}%0A` +
                `*E-mail:* ${fd.get("email")}%0A` +
                `*Necessidade:* ${fd.get("mensagem")}`;
              window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
            }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                name="nome"
                required
                placeholder="Seu nome"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/60 transition"
              />
              <input
                name="empresa"
                placeholder="Empresa (opcional)"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/60 transition"
              />
              <input
                name="telefone"
                required
                placeholder="Telefone / WhatsApp"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/60 transition"
              />
              <input
                name="email"
                type="email"
                placeholder="E-mail (opcional)"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/60 transition"
              />
            </div>
            <textarea
              name="mensagem"
              required
              rows={4}
              placeholder="Conte brevemente sua necessidade..."
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/60 transition resize-none"
            />
            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider"
            >
              Enviar e falar no WhatsApp
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-center text-xs text-white/40">
              Ao enviar, você será direcionado ao WhatsApp com sua mensagem pré-preenchida.
            </p>
          </form>

          {/* Contatos diretos */}
          <div className="mt-10 grid sm:grid-cols-3 gap-3 text-center">
            <a href={`tel:+${WHATSAPP_NUMBER}`} className="rounded-xl border border-white/10 bg-white/[0.02] py-4 px-3 hover:border-primary/40 transition group">
              <Phone className="w-5 h-5 text-primary mx-auto mb-2 group-hover:scale-110 transition" />
              <div className="text-xs text-white/50 uppercase tracking-wider">Telefone</div>
              <div className="text-sm text-white font-semibold mt-1">{PHONE_DISPLAY}</div>
            </a>
            <a href={`mailto:${EMAIL}`} className="rounded-xl border border-white/10 bg-white/[0.02] py-4 px-3 hover:border-primary/40 transition group">
              <Mail className="w-5 h-5 text-primary mx-auto mb-2 group-hover:scale-110 transition" />
              <div className="text-xs text-white/50 uppercase tracking-wider">E-mail</div>
              <div className="text-sm text-white font-semibold mt-1 truncate">{EMAIL}</div>
            </a>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] py-4 px-3">
              <MapPin className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-xs text-white/50 uppercase tracking-wider">Atendemos</div>
              <div className="text-sm text-white font-semibold mt-1">RJ e Grande Rio</div>
            </div>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="relative py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-[11px] sm:text-xs tracking-[0.3em] uppercase text-white/60">
            <span className="text-primary font-bold">Espier.Telecom</span>
            <span className="mx-3 text-white/20">|</span>
            {footerLine}
          </p>
        </div>
      </footer>
    </main>
  );
};

export default BannerLanding;
