import { Shield } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-12 relative bg-secondary/30">
    <div className="section-container relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold text-foreground">
            Espier.<span className="text-primary">Telecom</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <a href="#home" className="hover:text-primary transition-colors">Home</a>
          <a href="#sobre" className="hover:text-primary transition-colors">Sobre</a>
          <a href="#servicos" className="hover:text-primary transition-colors">Serviços</a>
          <a href="#seguranca" className="hover:text-primary transition-colors">Segurança</a>
          <a href="#contato" className="hover:text-primary transition-colors">Contato</a>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Espier.Telecom. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
