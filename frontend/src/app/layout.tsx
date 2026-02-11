"use client";

import { Outfit, Instrument_Serif, Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  TreePalm,
  CalendarRange,
  CalendarHeart,
  CalendarClock,
  Menu,
  X,
  RefreshCw,
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
import { triggerCrawl, getCrawlStatus } from "@/lib/api";
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
  { href: "/#resto-dansant", label: "Restos dansants", icon: Music },
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
  const [crawling, setCrawling] = useState(false);

  async function handleCrawl() {
    try {
      setCrawling(true);
      await triggerCrawl();
      await new Promise<void>((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const status = await getCrawlStatus();
            if (!status.is_running) {
              clearInterval(interval);
              resolve();
            }
          } catch {
            clearInterval(interval);
            reject(new Error("Erreur lors du suivi du crawl"));
          }
        }, 3000);
      });
    } catch {
      // silently fail — sidebar crawl is a background action
    } finally {
      setCrawling(false);
    }
  }

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
            <SidebarContent pathname={pathname} onNavigate={() => {}} onCrawl={handleCrawl} crawling={crawling} />
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
                    onCrawl={handleCrawl}
                    crawling={crawling}
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
              onClick={onNavigate}
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
  onCrawl,
  crawling,
}: {
  pathname: string;
  onNavigate: () => void;
  onCrawl?: () => void;
  crawling?: boolean;
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

      {/* Decorative palm tree illustration */}
      <div className="hidden lg:flex flex-1 items-end justify-center overflow-hidden min-h-0 px-6 pb-3">
        <svg
          viewBox="0 0 200 280"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-h-52"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <linearGradient id="p-trunk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AA55" />
              <stop offset="100%" stopColor="#7A5A28" />
            </linearGradient>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="100" cy="272" rx="28" ry="5" fill="#329E96" opacity="0.1" />

          {/* Trunk — tapered body */}
          <path
            d="M94 270 C93 248 92 225 93 200 C94 175 96 150 100 128 L106 128 C103 150 101 175 100 200 C99 225 100 248 101 270 Z"
            fill="url(#p-trunk)" opacity="0.5"
          />
          {/* Trunk rings */}
          <path d="M94 260 Q97.5 257 101 260" stroke="#3D2510" strokeWidth="2.5" fill="none" opacity="0.28" />
          <path d="M93.5 248 Q97 245 100.5 248" stroke="#3D2510" strokeWidth="2.5" fill="none" opacity="0.26" />
          <path d="M93 236 Q96.5 233 100 236" stroke="#3D2510" strokeWidth="2.5" fill="none" opacity="0.24" />
          <path d="M93 224 Q96.5 221 100 224" stroke="#3D2510" strokeWidth="2.5" fill="none" opacity="0.22" />
          <path d="M93.5 212 Q97 209 100 212" stroke="#3D2510" strokeWidth="2" fill="none" opacity="0.2" />
          <path d="M94 200 Q97 197 100 200" stroke="#3D2510" strokeWidth="2" fill="none" opacity="0.18" />
          <path d="M95 189 Q97.5 186 100 189" stroke="#3D2510" strokeWidth="2" fill="none" opacity="0.16" />
          <path d="M95.5 178 Q98 175 100 178" stroke="#3D2510" strokeWidth="1.5" fill="none" opacity="0.14" />
          <path d="M96 168 Q98 165 100 168" stroke="#3D2510" strokeWidth="1.5" fill="none" opacity="0.12" />
          <path d="M97 158 Q99 155 100.5 158" stroke="#3D2510" strokeWidth="1.5" fill="none" opacity="0.1" />
          <path d="M98 149 Q99.5 146 101 149" stroke="#3D2510" strokeWidth="1" fill="none" opacity="0.08" />
          <path d="M99 140 Q100 137 101.5 140" stroke="#3D2510" strokeWidth="1" fill="none" opacity="0.06" />

          {/* === FRONDS — back layer (dark teal) === */}
          {/* Left upper */}
          <path d="M98 124 L73 114 L85 106 L63 94 L75 86 L53 74 L65 66 L45 54 L55 46 L38 36 L45 22 L60 20 L58 32 L72 38 L70 50 L82 58 L80 68 L92 78 L90 88 L102 98 L100 108 Z" fill="#1A8A7E" opacity="0.3" />
          {/* Right upper */}
          <path d="M102 124 L127 114 L115 106 L137 94 L125 86 L147 74 L135 66 L155 54 L145 46 L162 36 L155 22 L140 20 L142 32 L128 38 L130 50 L118 58 L120 68 L108 78 L110 88 L98 98 L100 108 Z" fill="#1A8A7E" opacity="0.3" />
          {/* Center */}
          <path d="M100 124 L114 108 L102 100 L114 78 L103 70 L114 50 L103 42 L114 24 L105 16 L102 10 L98 16 L86 24 L97 42 L86 50 L98 70 L86 78 L98 100 L86 108 Z" fill="#1E9488" opacity="0.28" />

          {/* === FRONDS — mid layer (medium teal) === */}
          {/* Left middle */}
          <path d="M97 126 L85 98 L80 110 L65 88 L60 102 L45 82 L40 96 L25 78 L22 94 L10 82 L5 92 L10 110 L20 108 L25 118 L40 112 L45 120 L60 114 L65 124 L80 118 L85 126 L92 122 Z" fill="#28A89A" opacity="0.38" />
          {/* Right middle */}
          <path d="M103 126 L115 98 L120 110 L135 88 L140 102 L155 82 L160 96 L175 78 L178 94 L190 82 L195 92 L190 110 L180 108 L175 118 L160 112 L155 120 L140 114 L135 124 L120 118 L115 126 L108 122 Z" fill="#28A89A" opacity="0.38" />

          {/* === FRONDS — front layer (bright teal) === */}
          {/* Left drooping */}
          <path d="M97 128 L88 108 L82 116 L70 100 L64 112 L50 98 L44 110 L30 100 L26 114 L12 108 L8 128 L12 148 L24 142 L28 148 L42 138 L46 146 L60 136 L64 142 L78 134 L82 140 L92 135 Z" fill="#2DBAA8" opacity="0.35" />
          {/* Right drooping */}
          <path d="M103 128 L112 108 L118 116 L130 100 L136 112 L150 98 L156 110 L170 100 L174 114 L188 108 L192 128 L188 148 L176 142 L172 148 L158 138 L154 146 L140 136 L136 142 L122 134 L118 140 L108 135 Z" fill="#2DBAA8" opacity="0.35" />
        </svg>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-4 py-4">
        <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative h-2 w-2">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                <div className="relative h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              </div>
              <p className="text-[11px] font-medium text-white/50">
                Systeme actif
              </p>
            </div>
            {onCrawl && (
              <button
                onClick={onCrawl}
                disabled={crawling}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-all hover:bg-white/10 hover:text-white/60 disabled:opacity-50"
                title={crawling ? "Crawl en cours..." : "Lancer un crawl"}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${crawling ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
          <p className="mt-1 text-[10px] text-white/25">
            v0.1.0 &middot; Cannes, France
          </p>
        </div>
      </div>
    </>
  );
}
