import { useState, useRef, useEffect } from "react";
import { Menu, X, Shield, ChevronDown, Phone } from "lucide-react";
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
  {
    label: "TI",
    href: "/ti",
    subLinks: [
      { label: "TI Empresarial", to: "/ti" },
      { label: "Telecom", to: "/ti/telecom" },
    ],
  },
  { label: "Portfólio", href: "#portfolio" },
  { label: "Contato", href: "#contato" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-2xl border-b border-border shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
          : "bg-background/40 backdrop-blur-md"
      }`}
    >
      <div className="section-container flex items-center justify-between h-16 lg:h-20">
        <a href="/#home" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center group-hover:glow-red transition-all">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg lg:text-xl font-extrabold tracking-tight text-foreground">
            Espier<span className="text-primary">.</span>Telecom
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) =>
            link.subLinks ? (
              <div key={link.label} className="relative" ref={openDropdown === link.label ? dropdownRef : undefined}>
                <button
                  className="flex items-center gap-1 text-sm font-semibold text-foreground/75 hover:text-primary transition-colors"
                  onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                >
                  {link.label}
                  <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === link.label && (
                  <div className="absolute top-full left-0 mt-3 w-56 rounded-xl border border-border bg-popover backdrop-blur-xl shadow-xl py-2 z-50">
                    {link.href.startsWith("#") && (
                      <>
                        <a
                          href={link.href}
                          onClick={() => setOpenDropdown(null)}
                          className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          Visão Geral
                        </a>
                        <div className="border-t border-border my-1" />
                      </>
                    )}
                    {link.subLinks.map((sub) => (
                      <Link
                        key={sub.to}
                        to={sub.to}
                        onClick={() => setOpenDropdown(null)}
                        className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
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
                className="text-sm font-semibold text-foreground/75 hover:text-primary transition-colors relative after:absolute after:bottom-[-6px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            )
          )}
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-red font-bold">
            <a href="/#contato">
              <Phone className="w-3.5 h-3.5 mr-1.5" />
              Solicitar Orçamento
            </a>
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
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border pb-6">
          <div className="section-container flex flex-col gap-1 pt-2">
            {navLinks.map((link) =>
              link.subLinks ? (
                <div key={link.label}>
                  <button
                    className="flex items-center gap-1 text-sm font-semibold text-foreground/85 hover:text-primary transition-colors py-3 w-full text-left"
                    onClick={() => setOpenMobileSub(openMobileSub === link.label ? null : link.label)}
                  >
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${openMobileSub === link.label ? "rotate-180" : ""}`} />
                  </button>
                  {openMobileSub === link.label && (
                    <div className="pl-4 flex flex-col gap-1 border-l-2 border-primary/40 ml-2">
                      {link.href.startsWith("#") && (
                        <a
                          href={link.href}
                          onClick={() => { setOpen(false); setOpenMobileSub(null); }}
                          className="text-sm text-foreground/70 hover:text-primary py-2"
                        >
                          Visão Geral
                        </a>
                      )}
                      {link.subLinks.map((sub) => (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          onClick={() => { setOpen(false); setOpenMobileSub(null); }}
                          className="text-sm text-foreground/70 hover:text-primary py-2"
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
                  className="text-sm font-semibold text-foreground/85 hover:text-primary transition-colors py-3"
                >
                  {link.label}
                </a>
              )
            )}
            <Button
              asChild
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-red w-fit mt-2 font-bold"
            >
              <a href="/#contato" onClick={() => setOpen(false)}>Solicitar Orçamento</a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
