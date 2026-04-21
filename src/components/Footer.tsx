import { Shield } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-12 relative bg-foreground text-white">
    <div className="section-container relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold">
            Espier.<span className="text-primary">Telecom</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-white/70">
          <a href="/#home" className="hover:text-accent transition-colors">Home</a>
          <a href="/#sobre" className="hover:text-accent transition-colors">Sobre</a>
          <a href="/#servicos" className="hover:text-accent transition-colors">Serviços</a>
          <a href="/#seguranca" className="hover:text-accent transition-colors">Segurança</a>
          <a href="/#contato" className="hover:text-accent transition-colors">Contato</a>
        </div>
        <p className="text-xs sm:text-sm text-white/60 text-center">
          © {new Date().getFullYear()} Espier.Telecom. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
