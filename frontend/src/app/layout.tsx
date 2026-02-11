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
              <stop offset="0%" stopColor="#C49A4C" />
              <stop offset="100%" stopColor="#5C4A28" />
            </linearGradient>
            <linearGradient id="p-leaf" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#D4AA55" />
              <stop offset="60%" stopColor="#A8883F" />
              <stop offset="100%" stopColor="#6B5A2E" />
            </linearGradient>
            <radialGradient id="p-glow" cx="52%" cy="25%" r="40%">
              <stop offset="0%" stopColor="#C49A4C" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#C49A4C" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient glow behind crown */}
          <ellipse cx="102" cy="70" rx="80" ry="55" fill="url(#p-glow)" />

          {/* Trunk */}
          <path
            d="M100 275 C99 250 98 225 98 200 C98 178 100 158 102 140 C103 126 104 114 105 104 C106 96 106 90 106 86"
            fill="none" stroke="url(#p-trunk)" strokeWidth="7" strokeLinecap="round" opacity="0.55"
          />
          {/* Bark rings */}
          <path d="M99 245 Q101 243 103 245" stroke="#C49A4C" strokeWidth="0.8" fill="none" opacity="0.15" />
          <path d="M99 222 Q101 220 104 222" stroke="#C49A4C" strokeWidth="0.8" fill="none" opacity="0.13" />
          <path d="M99 200 Q102 198 104 200" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.11" />
          <path d="M100 178 Q103 176 105 178" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.09" />
          <path d="M101 158 Q104 156 106 158" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.08" />

          {/* Left frond 1 — lowest droop */}
          <path d="M106 86 C90 78 60 76 18 98 C25 92 36 87 48 84 C68 80 90 80 106 88" fill="url(#p-leaf)" opacity="0.28" />
          <path d="M106 86 C90 78 60 76 18 98" stroke="#B8923E" strokeWidth="1.2" fill="none" opacity="0.3" />
          {/* Leaflets */}
          <path d="M88 80 L80 72 M78 79 L68 72 M67 78 L56 74 M56 78 L44 76 M44 80 L32 80 M34 83 L22 86" stroke="#B8923E" strokeWidth="0.6" fill="none" opacity="0.2" />
          <path d="M88 83 L83 90 M78 82 L72 89 M67 82 L60 89 M56 83 L48 89 M44 84 L36 90 M34 87 L25 93" stroke="#B8923E" strokeWidth="0.6" fill="none" opacity="0.17" />

          {/* Left frond 2 — mid */}
          <path d="M106 85 C86 68 52 54 10 60 C18 56 28 53 40 52 C62 51 86 63 106 85" fill="url(#p-leaf)" opacity="0.35" />
          <path d="M106 85 C86 68 52 54 10 60" stroke="#C49A4C" strokeWidth="1.3" fill="none" opacity="0.35" />
          {/* Leaflets */}
          <path d="M90 70 L83 61 M78 66 L69 57 M66 62 L55 55 M54 59 L42 54 M42 57 L28 55 M30 59 L16 58" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.22" />
          <path d="M90 73 L86 79 M78 69 L73 76 M66 66 L60 73 M54 64 L47 71 M42 62 L34 68 M30 62 L21 67" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.18" />

          {/* Left frond 3 — upper */}
          <path d="M106 84 C93 58 74 34 38 14 C45 16 53 20 60 26 C78 40 93 58 106 84" fill="url(#p-leaf)" opacity="0.3" />
          <path d="M106 84 C93 58 74 34 38 14" stroke="#C49A4C" strokeWidth="1.1" fill="none" opacity="0.28" />

          {/* Right frond 1 — lowest droop */}
          <path d="M106 86 C120 78 150 76 192 98 C185 92 174 87 162 84 C142 80 120 80 106 88" fill="url(#p-leaf)" opacity="0.28" />
          <path d="M106 86 C120 78 150 76 192 98" stroke="#B8923E" strokeWidth="1.2" fill="none" opacity="0.3" />
          {/* Leaflets */}
          <path d="M122 80 L130 72 M132 79 L142 72 M143 78 L154 74 M154 78 L166 76 M166 80 L178 80 M176 83 L188 86" stroke="#B8923E" strokeWidth="0.6" fill="none" opacity="0.2" />
          <path d="M122 83 L127 90 M132 82 L138 89 M143 82 L150 89 M154 83 L162 89 M166 84 L174 90 M176 87 L185 93" stroke="#B8923E" strokeWidth="0.6" fill="none" opacity="0.17" />

          {/* Right frond 2 — mid */}
          <path d="M106 85 C125 68 158 54 198 60 C190 56 180 53 168 52 C146 51 123 63 106 85" fill="url(#p-leaf)" opacity="0.35" />
          <path d="M106 85 C125 68 158 54 198 60" stroke="#C49A4C" strokeWidth="1.3" fill="none" opacity="0.35" />
          {/* Leaflets */}
          <path d="M120 70 L127 61 M132 66 L141 57 M144 62 L155 55 M156 59 L168 54 M168 57 L182 55 M180 59 L194 58" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.22" />
          <path d="M120 73 L124 79 M132 69 L137 76 M144 66 L150 73 M156 64 L163 71 M168 62 L176 68 M180 62 L189 67" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.18" />

          {/* Right frond 3 — upper */}
          <path d="M106 84 C118 58 138 34 172 14 C165 16 157 20 150 26 C132 40 118 58 106 84" fill="url(#p-leaf)" opacity="0.3" />
          <path d="M106 84 C118 58 138 34 172 14" stroke="#C49A4C" strokeWidth="1.1" fill="none" opacity="0.28" />

          {/* Top center frond */}
          <path d="M106 84 C105 62 107 40 112 10 C110 40 108 62 107 84" fill="url(#p-leaf)" opacity="0.22" />
          <path d="M106 84 C105 62 107 40 112 10" stroke="#C49A4C" strokeWidth="0.9" fill="none" opacity="0.22" />

          {/* Coconuts */}
          <ellipse cx="102" cy="89" rx="4" ry="4.5" fill="#8B7435" opacity="0.4" />
          <ellipse cx="110" cy="87" rx="3.5" ry="4" fill="#7A6530" opacity="0.35" />
          <ellipse cx="106" cy="93" rx="3" ry="3.5" fill="#6B5A2E" opacity="0.3" />
          {/* Coconut highlights */}
          <ellipse cx="101" cy="88" rx="1.5" ry="1" fill="#D4AA55" opacity="0.12" />
          <ellipse cx="109" cy="86" rx="1.2" ry="0.8" fill="#D4AA55" opacity="0.1" />
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
