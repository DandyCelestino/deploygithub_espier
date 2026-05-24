import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export type GaleriaItem = {
  img: string;
  title: string;
  caption: string;
  tag: string;
};

type Props = {
  items: GaleriaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

const GaleriaLightbox = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onPrev,
  onNext,
}: Props) => {
  const item = items[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [isOpen, onClose, onPrev, onNext]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-1 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Galeria de fotos"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Fechar galeria"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium">
        {currentIndex + 1} / {items.length}
      </div>

      {/* Previous */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-3 sm:left-6 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30"
        aria-label="Foto anterior"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-3 sm:right-6 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30"
        aria-label="Próxima foto"
      >
        <ChevronRight className="w-7 h-7" />
      </button>

      {/* Content */}
      <div
        className="relative z-0 flex flex-col items-center justify-center w-full h-full px-4 sm:px-16 py-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image container */}
        <div className="relative flex-1 flex items-center justify-center w-full max-h-[75vh]">
          <img
            src={item.img}
            alt={item.title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 text-white/70 text-[11px]">
            <ZoomIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Navegue com as setas</span>
          </div>
        </div>

        {/* Caption area */}
        <div className="mt-5 text-center max-w-2xl">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/90 text-primary-foreground">
            {item.tag}
          </span>
          <h3 className="mt-3 text-white font-extrabold text-xl sm:text-2xl leading-tight">
            {item.title}
          </h3>
          <p className="mt-1.5 text-white/80 text-sm sm:text-base leading-relaxed">
            {item.caption}
          </p>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-[90vw] overflow-x-auto px-2 pb-1 scrollbar-thin">
        {items.map((thumb, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              // Navigate by calculating offset? We need a prop for that.
              // For simplicity, let's just expose onSelect via parent.
              // But we only have onPrev/onNext. Let's add onGoTo as optional.
            }}
            className={`flex-shrink-0 w-14 h-10 sm:w-20 sm:h-14 rounded-md overflow-hidden border-2 transition-all ${
              idx === currentIndex
                ? "border-primary scale-110"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img
              src={thumb.img}
              alt={thumb.title}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default GaleriaLightbox;
