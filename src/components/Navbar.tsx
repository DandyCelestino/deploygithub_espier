import { useState, useRef, useEffect } from "react";
import { Menu, X, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Sobre", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  {
    label: "Segurança",
    href: "#seguranca",
    subLinks: [
      { label: "Alarmes", to: "/seguranca/alarmes" },
      { label: "CFTV", to: "/seguranca/cftv" },
      { label: "Controle de Acesso", to: "/seguranca/controle-de-acesso" },
    ],
  },
  { label: "Portfólio", href: "#portfolio" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Contato", href: "#contato" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-xl border-b border-border shadow-sm" : "bg-white/60 backdrop-blur-sm"}`}>
      <div className="section-container flex items-center justify-between h-16 lg:h-20">
        <a href="#home" className="flex items-center gap-2 group">
          <Shield className="w-8 h-8 text-primary group-hover:drop-shadow-[0_0_8px_hsl(145_70%_40%/0.5)] transition-all" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Espier.<span className="text-primary">Telecom</span>
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) =>
            link.subLinks ? (
              <div key={link.href} className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {link.label}
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-border py-2 z-50">
                    <a
                      href={link.href}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      Visão Geral
                    </a>
                    <div className="border-t border-border/50 my-1" />
                    {link.subLinks.map((sub) => (
                      <Link
                        key={sub.to}
                        to={sub.to}
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            )
          )}
          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green"
          >
            <a href="#contato">Solicitar Orçamento</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white/98 backdrop-blur-xl border-b border-border pb-6">
          <div className="section-container flex flex-col gap-1 pt-2">
            {navLinks.map((link) =>
              link.subLinks ? (
                <div key={link.href}>
                  <button
                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-3 w-full text-left"
                    onClick={() => setMobileSubOpen(!mobileSubOpen)}
                  >
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileSubOpen && (
                    <div className="pl-4 flex flex-col gap-1 border-l-2 border-primary/30 ml-2">
                      <a
                        href={link.href}
                        onClick={() => { setOpen(false); setMobileSubOpen(false); }}
                        className="text-sm text-muted-foreground hover:text-primary py-2"
                      >
                        Visão Geral
                      </a>
                      {link.subLinks.map((sub) => (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          onClick={() => { setOpen(false); setMobileSubOpen(false); }}
                          className="text-sm text-muted-foreground hover:text-primary py-2"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-3"
                >
                  {link.label}
                </a>
              )
            )}
            <Button
              asChild
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-fit mt-2"
            >
              <a href="#contato" onClick={() => setOpen(false)}>Solicitar Orçamento</a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
