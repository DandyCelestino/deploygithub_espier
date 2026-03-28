import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/5521960001439"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Fale conosco pelo WhatsApp"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[hsl(142,70%,45%)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
    style={{ animation: "pulse-glow 2s infinite" }}
  >
    <MessageCircle className="w-7 h-7 text-[hsl(0,0%,100%)]" />
  </a>
);

export default WhatsAppButton;
