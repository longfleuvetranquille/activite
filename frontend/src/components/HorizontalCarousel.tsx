"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalCarouselProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export default function HorizontalCarousel({
  children,
  className = "",
  dark = false,
}: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <div
      className={`group/carousel relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hidden"
      >
        {children}
      </div>

      {/* Left fade */}
      {canScrollLeft && (
        <div className={`pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-16 bg-gradient-to-r ${dark ? "from-[#0f0d2e]" : "from-[#FAF8F3]"} to-transparent`} />
      )}

      {/* Right fade */}
      {canScrollRight && (
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-16 bg-gradient-to-l ${dark ? "from-[#0f0d2e]" : "from-[#FAF8F3]"} to-transparent`} />
      )}

      {/* Left arrow */}
      {canScrollLeft && isHovered && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 shadow-elevated backdrop-blur-sm transition-all hover:bg-white hover:shadow-elevated-lg active:scale-95 lg:flex"
        >
          <ChevronLeft className="h-4 w-4 text-slate-700" />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && isHovered && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 shadow-elevated backdrop-blur-sm transition-all hover:bg-white hover:shadow-elevated-lg active:scale-95 lg:flex"
        >
          <ChevronRight className="h-4 w-4 text-slate-700" />
        </button>
      )}
    </div>
  );
}
