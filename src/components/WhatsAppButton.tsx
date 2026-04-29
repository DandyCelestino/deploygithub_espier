import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/5521960001439"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Fale conosco pelo WhatsApp"
    className="group fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 flex items-center gap-3 pl-4 pr-5 py-3 rounded-full bg-[#25D366] hover:bg-[#1ebe57] shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-all hover:scale-[1.04]"
  >
    <span className="relative flex w-10 h-10 items-center justify-center rounded-full bg-white/15">
      <span className="absolute inline-flex h-full w-full rounded-full bg-white/30 opacity-60 animate-ping" />
      <MessageCircle className="relative w-5 h-5 text-white" />
    </span>
    <span className="hidden sm:flex flex-col leading-tight text-white">
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Fale agora</span>
      <span className="text-sm font-extrabold">WhatsApp</span>
    </span>
  </a>
);

export default WhatsAppButton;
