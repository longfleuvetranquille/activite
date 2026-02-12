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
      <div className="hidden lg:flex flex-1 items-end justify-center overflow-hidden min-h-0 px-4 pb-2">
        <svg
          viewBox="0 0 240 340"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-h-72"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <linearGradient id="p-trunk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C49A4C" />
              <stop offset="100%" stopColor="#8B7435" />
            </linearGradient>
          </defs>

          {/* Trunk — taller, gentle curve */}
          <path
            d="M120 335 C119 305 117 270 116 240 C115 210 116 180 118 155 C120 135 122 118 124 105"
            stroke="url(#p-trunk)" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.5"
          />
          {/* Trunk rings */}
          <path d="M117 310 Q120 308 123 310" stroke="#C49A4C" strokeWidth="1" fill="none" opacity="0.15" />
          <path d="M116 280 Q120 278 124 280" stroke="#C49A4C" strokeWidth="1" fill="none" opacity="0.13" />
          <path d="M115.5 250 Q119 248 123 250" stroke="#C49A4C" strokeWidth="0.8" fill="none" opacity="0.11" />
          <path d="M116 220 Q119.5 218 123 220" stroke="#C49A4C" strokeWidth="0.8" fill="none" opacity="0.09" />
          <path d="M117 190 Q120 188 123.5 190" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.07" />
          <path d="M118 165 Q121 163 124 165" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.06" />

          {/* Left drooping frond — large, sweeping */}
          <path d="M124 105 C100 92 55 88 -5 118" stroke="#C49A4C" strokeWidth="2.4" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M98 94 L88 84 M82 92 L70 83 M66 90 L52 84 M50 92 L34 88 M35 96 L16 96" stroke="#C49A4C" strokeWidth="0.9" fill="none" opacity="0.22" />
          <path d="M98 98 L92 108 M82 97 L74 107 M66 96 L56 106 M50 98 L40 108 M35 102 L24 112" stroke="#C49A4C" strokeWidth="0.9" fill="none" opacity="0.16" />

          {/* Left mid frond — wide reach */}
          <path d="M124 102 C92 76 48 56 -10 62" stroke="#C49A4C" strokeWidth="2.2" fill="none" opacity="0.35" strokeLinecap="round" />
          <path d="M96 80 L86 68 M78 72 L66 62 M62 68 L48 60 M48 66 L32 60 M32 66 L14 62" stroke="#C49A4C" strokeWidth="0.8" fill="none" opacity="0.2" />
          <path d="M96 85 L92 94 M78 78 L72 87 M62 74 L54 83 M48 72 L40 81 M32 72 L22 80" stroke="#C49A4C" strokeWidth="0.8" fill="none" opacity="0.14" />

          {/* Left upper frond — arching up */}
          <path d="M124 100 C108 70 84 38 40 10" stroke="#C49A4C" strokeWidth="1.8" fill="none" opacity="0.3" strokeLinecap="round" />
          <path d="M110 72 L100 60 M96 58 L84 48 M82 46 L68 38 M68 36 L54 28" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.17" />
          <path d="M110 77 L108 86 M96 65 L92 74 M82 53 L76 62 M68 44 L62 52" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.13" />

          {/* Right drooping frond — large, sweeping */}
          <path d="M124 105 C148 92 193 88 245 118" stroke="#C49A4C" strokeWidth="2.4" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M146 94 L156 84 M162 92 L174 83 M178 90 L192 84 M194 92 L210 88 M209 96 L228 96" stroke="#C49A4C" strokeWidth="0.9" fill="none" opacity="0.22" />
          <path d="M146 98 L152 108 M162 97 L170 107 M178 96 L188 106 M194 98 L204 108 M209 102 L220 112" stroke="#C49A4C" strokeWidth="0.9" fill="none" opacity="0.16" />

          {/* Right mid frond — wide reach */}
          <path d="M124 102 C156 76 200 56 250 62" stroke="#C49A4C" strokeWidth="2.2" fill="none" opacity="0.35" strokeLinecap="round" />
          <path d="M148 80 L158 68 M166 72 L178 62 M182 68 L196 60 M196 66 L212 60 M212 66 L230 62" stroke="#C49A4C" strokeWidth="0.8" fill="none" opacity="0.2" />
          <path d="M148 85 L152 94 M166 78 L172 87 M182 74 L190 83 M196 72 L204 81 M212 72 L222 80" stroke="#C49A4C" strokeWidth="0.8" fill="none" opacity="0.14" />

          {/* Right upper frond — arching up */}
          <path d="M124 100 C140 70 164 38 200 10" stroke="#C49A4C" strokeWidth="1.8" fill="none" opacity="0.3" strokeLinecap="round" />
          <path d="M134 72 L144 60 M148 58 L160 48 M162 46 L176 38 M176 36 L190 28" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.17" />
          <path d="M134 77 L136 86 M148 65 L152 74 M162 53 L168 62 M176 44 L182 52" stroke="#C49A4C" strokeWidth="0.7" fill="none" opacity="0.13" />

          {/* Center frond — tall */}
          <path d="M124 100 C123 68 125 38 130 5" stroke="#C49A4C" strokeWidth="1.6" fill="none" opacity="0.28" strokeLinecap="round" />
          <path d="M123 75 L114 66 M124 55 L115 46 M125 38 L117 30 M126 22 L118 14" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.14" />
          <path d="M125 75 L134 66 M126 55 L134 46 M127 38 L135 30 M128 22 L136 14" stroke="#C49A4C" strokeWidth="0.6" fill="none" opacity="0.14" />

          {/* Coconuts */}
          <ellipse cx="120" cy="108" rx="4.5" ry="5" fill="#8B7435" opacity="0.3" />
          <ellipse cx="128" cy="106" rx="4" ry="4.5" fill="#7A6530" opacity="0.25" />
          <ellipse cx="123" cy="113" rx="3.5" ry="4" fill="#6B5A2E" opacity="0.2" />
        </svg>
      </div>

    </>
  );
}
