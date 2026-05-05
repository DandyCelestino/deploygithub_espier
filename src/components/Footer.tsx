import { Shield, Phone, Mail, MapPin, MessageCircle, Linkedin, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="relative border-t border-border bg-[hsl(220_22%_10%)] text-white overflow-hidden">
    {/* Glow decorativo */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

    <div className="relative section-container py-16 lg:py-20">
      <div className="grid gap-10 lg:gap-12 lg:grid-cols-12">
        {/* Brand */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center glow-red-soft">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Espier<span className="text-primary">.</span>Telecom
            </span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed max-w-sm">
            TI, manutenção, infra estrutura e segurança eletrônica de alto padrão.
            Soluções completas para empresas que não admitem improviso.
          </p>

          <div className="mt-6 flex items-center gap-3">
            {[
              { icon: Linkedin, href: "#", label: "LinkedIn" },
              { icon: Instagram, href: "#", label: "Instagram" },
              { icon: Facebook, href: "#", label: "Facebook" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-lg border border-white/15 bg-white/[0.04] flex items-center justify-center text-white/70 hover:text-primary hover:border-primary/40 transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Navegação */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-white mb-4">Site</h4>
          <ul className="space-y-2.5 text-sm">
            <li><a href="/#home" className="text-white/65 hover:text-primary transition-colors">Home</a></li>
            <li><a href="/#sobre" className="text-white/65 hover:text-primary transition-colors">Sobre</a></li>
            <li><a href="/#servicos" className="text-white/65 hover:text-primary transition-colors">Serviços</a></li>
            <li><a href="/#portfolio" className="text-white/65 hover:text-primary transition-colors">Portfólio</a></li>
            <li><a href="/#contato" className="text-white/65 hover:text-primary transition-colors">Contato</a></li>
          </ul>
        </div>

        {/* Soluções */}
        <div className="lg:col-span-3">
          <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-white mb-4">Soluções</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/ti" className="text-white/65 hover:text-primary transition-colors">TI Empresarial</Link></li>
            <li><Link to="/ti/telecom" className="text-white/65 hover:text-primary transition-colors">Telecom</Link></li>
            <li><Link to="/seguranca/cftv" className="text-white/65 hover:text-primary transition-colors">CFTV</Link></li>
            <li><Link to="/seguranca/alarmes" className="text-white/65 hover:text-primary transition-colors">Alarmes</Link></li>
            <li><Link to="/seguranca/controle-de-acesso" className="text-white/65 hover:text-primary transition-colors">Controle de Acesso</Link></li>
          </ul>
        </div>

        {/* Contato */}
        <div className="lg:col-span-3">
          <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-white mb-4">Contato</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="https://wa.me/5521960001439" target="_blank" rel="noreferrer" className="flex items-start gap-2.5 text-white/75 hover:text-primary transition-colors group">
                <MessageCircle className="w-4 h-4 mt-0.5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                <span>(21) 96000-1439<br/><span className="text-xs text-white/50">WhatsApp 24/7</span></span>
              </a>
            </li>
            <li>
              <a href="tel:+5521960001439" className="flex items-start gap-2.5 text-white/75 hover:text-primary transition-colors">
                <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>(21) 96000-1439</span>
              </a>
            </li>
            <li>
              <a href="mailto:espier.telecom@gmail.com" className="flex items-start gap-2.5 text-white/75 hover:text-primary transition-colors break-all">
                <Mail className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>espier.telecom@gmail.com</span>
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-white/75">
              <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>RJ — Região Serrana, dos Lagos, Grande Rio e Costa Verde</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-14 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/55 text-center sm:text-left">
          © {new Date().getFullYear()} <span className="text-white/80 font-semibold">Espier.Telecom</span>. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/admin/auth" className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-primary transition-colors">
            Área restrita
          </Link>
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/50">
            Tecnologia · Segurança · Confiança
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
