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
              <stop offset="100%" stopColor="#8B7435" />
            </linearGradient>
          </defs>

          {/* Trunk */}
          <path
            d="M100 275 C99 250 97 220 97 195 C97 170 99 145 102 125 C104 110 106 98 107 90"
            stroke="url(#p-trunk)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.45"
          />
          {/* Trunk rings */}
          <path d="M98 250 Q100 248 102 250" stroke="#C49A4C" strokeWidth="0.8" fill="none" opacity="0.15" />
          <path d="M97.5 230 Q100 228 102.5 230" stroke="#C49A4C" strokeWidth="0.8" fill="none" opacity="0.13" />
          <path d="M97 210 Q100 208 103 210" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.11" />
          <path d="M97.5 190 Q100.5 188 103 190" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.09" />
          <path d="M98 170 Q101 168 103.5 170" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.07" />

          {/* Left drooping frond */}
          <path d="M107 90 C88 80 55 78 15 100" stroke="#C49A4C" strokeWidth="1.8" fill="none" opacity="0.35" strokeLinecap="round" />
          <path d="M85 82 L78 74 M72 80 L64 73 M60 80 L50 76 M48 82 L36 80 M36 85 L24 86" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.2" />
          <path d="M85 85 L80 92 M72 84 L66 91 M60 84 L53 91 M48 86 L40 92 M36 89 L28 95" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.15" />

          {/* Left mid frond */}
          <path d="M107 88 C82 68 48 52 8 58" stroke="#C49A4C" strokeWidth="1.6" fill="none" opacity="0.3" strokeLinecap="round" />
          <path d="M88 72 L82 63 M74 66 L66 58 M62 62 L52 56 M50 60 L38 56 M38 60 L24 58" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.18" />
          <path d="M88 76 L84 82 M74 72 L69 78 M62 68 L56 74 M50 66 L43 72 M38 66 L30 71" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.13" />

          {/* Left upper frond */}
          <path d="M107 86 C94 62 76 38 42 18" stroke="#C49A4C" strokeWidth="1.4" fill="none" opacity="0.25" strokeLinecap="round" />
          <path d="M96 62 L88 54 M86 52 L78 44 M76 42 L66 36 M66 34 L56 30" stroke="#C49A4C" strokeWidth="0.5" fill="none" opacity="0.15" />
          <path d="M96 66 L94 73 M86 58 L82 64 M76 48 L72 54 M66 40 L62 46" stroke="#C49A4C" strokeWidth="0.5" fill="none" opacity="0.12" />

          {/* Right drooping frond */}
          <path d="M107 90 C126 80 155 78 195 100" stroke="#C49A4C" strokeWidth="1.8" fill="none" opacity="0.35" strokeLinecap="round" />
          <path d="M125 82 L132 74 M138 80 L146 73 M150 80 L160 76 M162 82 L174 80 M174 85 L186 86" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.2" />
          <path d="M125 85 L130 92 M138 84 L144 91 M150 84 L157 91 M162 86 L170 92 M174 89 L182 95" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.15" />

          {/* Right mid frond */}
          <path d="M107 88 C132 68 162 52 198 58" stroke="#C49A4C" strokeWidth="1.6" fill="none" opacity="0.3" strokeLinecap="round" />
          <path d="M122 72 L128 63 M136 66 L144 58 M148 62 L158 56 M160 60 L172 56 M172 60 L186 58" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.18" />
          <path d="M122 76 L126 82 M136 72 L141 78 M148 68 L154 74 M160 66 L167 72 M172 66 L180 71" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.13" />

          {/* Right upper frond */}
          <path d="M107 86 C120 62 138 38 168 18" stroke="#C49A4C" strokeWidth="1.4" fill="none" opacity="0.25" strokeLinecap="round" />
          <path d="M116 62 L124 54 M126 52 L134 44 M136 42 L146 36 M146 34 L156 30" stroke="#C49A4C" strokeWidth="0.5" fill="none" opacity="0.15" />
          <path d="M116 66 L118 73 M126 58 L130 64 M136 48 L140 54 M146 40 L150 46" stroke="#C49A4C" strokeWidth="0.5" fill="none" opacity="0.12" />

          {/* Center frond */}
          <path d="M107 86 C106 62 108 40 112 12" stroke="#C49A4C" strokeWidth="1.2" fill="none" opacity="0.22" strokeLinecap="round" />
          <path d="M106 65 L100 58 M107 48 L100 42 M108 32 L102 26" stroke="#C49A4C" strokeWidth="0.5" fill="none" opacity="0.12" />
          <path d="M108 65 L114 58 M109 48 L115 42 M110 32 L116 26" stroke="#C49A4C" strokeWidth="0.5" fill="none" opacity="0.12" />

          {/* Coconuts */}
          <ellipse cx="104" cy="92" rx="3.5" ry="4" fill="#8B7435" opacity="0.3" />
          <ellipse cx="110" cy="90" rx="3" ry="3.5" fill="#7A6530" opacity="0.25" />
          <ellipse cx="107" cy="96" rx="2.5" ry="3" fill="#6B5A2E" opacity="0.2" />
        </svg>
      </div>

    </>
  );
}
