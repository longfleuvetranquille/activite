"use client";

import { Outfit, Instrument_Serif, Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  TreePalm,
  CalendarRange,
  CalendarHeart,
  CalendarClock,
  Menu,
  X,
  Compass,
  Heart,
  Coffee,
  UtensilsCrossed,
  Wine,
  Music,
  Sparkles,
  Waves,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-body",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-logo",
});

const NAV_DASHBOARD = [
  { href: "/", label: "Dashboard", icon: TreePalm },
];

const NAV_PERIOD = [
  { href: "/weekend", label: "Ce week-end", icon: CalendarHeart },
  { href: "/week", label: "Cette semaine", icon: CalendarRange },
  { href: "/month", label: "Le mois a venir", icon: CalendarClock },
];

const NAV_ACTIVITIES = [
  { href: "/#timeless", label: "Intemporelles", icon: Compass },
  { href: "/#dates", label: "Idees de date", icon: Heart },
  { href: "/#cafes", label: "Cafes & brunchs", icon: Coffee },
  { href: "/#restaurants-date", label: "Restos date", icon: UtensilsCrossed },
  { href: "/#resto-dansant", label: "Restos & Bars dansants", icon: Music },
  { href: "/#clubs", label: "Clubs branches", icon: Sparkles },
  { href: "/#bars", label: "Bars branches", icon: Wine },
  { href: "/#beaches", label: "Plages & criques", icon: Waves },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <html lang="fr">
      <head>
        <title>Palmier</title>
        <meta
          name="description"
          content="Decouvre les meilleures activites a Cannes et sur la Cote d'Azur"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#C49A4C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Palmier" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${outfit.variable} ${instrumentSerif.variable} ${bodoniModa.variable} font-sans antialiased scrollbar-thin`}
      >
        <div className="flex min-h-screen overflow-x-hidden">
          {/* Desktop Sidebar */}
          <aside className="sidebar-dark fixed left-0 top-0 z-40 hidden h-full w-64 flex-col lg:flex">
            <SidebarContent pathname={pathname} onNavigate={() => {}} />
          </aside>

          {/* Mobile Header */}
          <header className="glass-header fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between px-4 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-champagne-500 to-olive-500">
                <TreePalm className="h-5 w-5 text-white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-champagne-500 to-olive-500 opacity-40 blur-lg" />
              </div>
              <span className="font-[family-name:var(--font-logo)] text-xl font-semibold tracking-wide text-slate-900">
                Palmier
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.06] bg-white/80 text-slate-500 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-champagne-600 hover:shadow-md"
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </header>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.aside
                  initial={{ x: -288 }}
                  animate={{ x: 0 }}
                  exit={{ x: -288 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="sidebar-dark fixed left-0 top-0 z-50 flex h-full w-72 flex-col shadow-elevated-lg lg:hidden"
                >
                  <SidebarContent
                    pathname={pathname}
                    onNavigate={() => setSidebarOpen(false)}
                  />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Animated Background */}
          <AnimatedBackground />

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden pt-16 lg:pl-64 lg:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  onNavigate,
  isAnchor,
}: {
  label: string;
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  pathname: string;
  onNavigate: () => void;
  isAnchor?: boolean;
}) {
  const router = useRouter();

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      const hash = href.split("#")[1];
      if (!hash) return;

      // If already on the home page, just scroll to anchor
      if (pathname === "/") {
        e.preventDefault();
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
        onNavigate();
        return;
      }

      // If on another page, navigate to / then scroll after load
      e.preventDefault();
      onNavigate();
      router.push("/");
      // Wait for the page to render, then scroll to anchor
      const tryScroll = (attempts: number) => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else if (attempts > 0) {
          setTimeout(() => tryScroll(attempts - 1), 100);
        }
      };
      setTimeout(() => tryScroll(20), 200);
    },
    [pathname, router, onNavigate]
  );

  return (
    <div>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = isAnchor ? false : pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isAnchor ? (e) => handleAnchorClick(e, item.href) : onNavigate}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "text-white"
                  : isAnchor
                    ? "text-white/40 hover:text-white/70"
                    : "text-white/40 hover:text-white/70"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-champagne-600/20 via-olive-500/10 to-transparent"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
              <div
                className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-champagne-500/20 text-champagne-400"
                    : "text-white/30 group-hover:bg-white/5 group-hover:text-white/60"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <div className="absolute right-3 top-1/2 z-10 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-champagne-500 shadow-sm shadow-champagne-500/50" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-champagne-500 to-olive-500 shadow-lg shadow-champagne-500/30">
          <TreePalm className="h-5 w-5 text-white" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-champagne-500 to-olive-500 opacity-50 blur-xl animate-glow-pulse" />
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-logo)] text-xl font-semibold tracking-wide text-white">Palmier</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 space-y-5">
        {/* Dashboard */}
        <NavGroup label="Dashboard" items={NAV_DASHBOARD} pathname={pathname} onNavigate={onNavigate} />

        {/* Par periode */}
        <NavGroup label="Par periode" items={NAV_PERIOD} pathname={pathname} onNavigate={onNavigate} />

        {/* Type d'activite */}
        <NavGroup label="Type d'activite" items={NAV_ACTIVITIES} pathname={pathname} onNavigate={onNavigate} isAnchor />
      </nav>

      {/* Decorative palm tree — minimal silhouette */}
      <div className="hidden lg:flex flex-1 items-end justify-center overflow-hidden min-h-0 px-2 pb-1">
        <svg
          viewBox="0 0 200 340"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-h-80"
          preserveAspectRatio="xMidYMax meet"
        >
          {/* Trunk — gentle curve with crown bulge */}
          <path
            d="M92 335 Q91 310 90 280 Q89 250 91 220 Q93 190 96 160 Q98 140 101 120 Q103 112 105 108
               L108 108
               Q106 112 105 120 Q103 140 102 160 Q100 190 99 220 Q98 250 99 280 Q100 310 99 335 Z"
            fill="#C49A4C" opacity="0.15"
          />
          {/* Crown bulge */}
          <ellipse cx="103" cy="108" rx="10" ry="6" fill="#C49A4C" opacity="0.12" />

          {/* Left drooping frond */}
          <path
            d="M100 105 C75 90 40 82 5 108 C40 78 75 82 100 100 Z"
            fill="#C49A4C" opacity="0.13"
          />
          {/* Left mid frond */}
          <path
            d="M102 102 C75 72 35 50 0 55 C35 42 75 60 102 96 Z"
            fill="#C49A4C" opacity="0.11"
          />
          {/* Left upper frond */}
          <path
            d="M103 100 C88 65 62 30 25 5 C65 22 90 58 103 94 Z"
            fill="#C49A4C" opacity="0.09"
          />
          {/* Right drooping frond */}
          <path
            d="M106 105 C131 90 166 82 200 108 C166 78 131 82 106 100 Z"
            fill="#C49A4C" opacity="0.13"
          />
          {/* Right mid frond */}
          <path
            d="M104 102 C131 72 171 50 200 55 C171 42 131 60 104 96 Z"
            fill="#C49A4C" opacity="0.11"
          />
          {/* Right upper frond */}
          <path
            d="M103 100 C118 65 144 30 181 5 C141 22 116 58 103 94 Z"
            fill="#C49A4C" opacity="0.09"
          />

          {/* Center frond */}
          <path
            d="M100 100 C98 60 98 30 103 0 C108 30 108 60 106 100 Z"
            fill="#C49A4C" opacity="0.09"
          />
        </svg>
      </div>

    </>
  );
}
