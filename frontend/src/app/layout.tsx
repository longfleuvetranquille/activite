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

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: TreePalm,
  },
  {
    href: "/weekend",
    label: "Ce week-end",
    icon: CalendarHeart,
  },
  {
    href: "/week",
    label: "Cette semaine",
    icon: CalendarRange,
  },
  {
    href: "/month",
    label: "Ce mois",
    icon: CalendarClock,
  },
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        <div className="flex min-h-screen">
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
          <main className="flex-1 pt-16 lg:pl-64 lg:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
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
      <nav className="px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
          Navigation
        </p>
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-white/50 hover:text-white/80"
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
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-champagne-500/20 text-champagne-400"
                      : "text-white/40 group-hover:bg-white/5 group-hover:text-white/70"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <div className="absolute right-3 top-1/2 z-10 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-champagne-500 shadow-sm shadow-champagne-500/50" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Decorative palm tree */}
      <div className="flex flex-1 items-end justify-center overflow-hidden px-6 pb-6">
        <svg
          viewBox="0 0 200 400"
          xmlns="http://www.w3.org/2000/svg"
          className="h-auto w-40 opacity-[0.14]"
        >
          {/* Trunk — thick curved body tapering upward */}
          <path
            d="M102 390 C104 370 108 345 110 320 C112 295 108 270 106 245 C104 220 108 195 107 172 C106 155 104 140 103 125"
            fill="none" stroke="url(#palm-g)" strokeWidth="14" strokeLinecap="round"
          />
          {/* Trunk bark texture */}
          {[360, 340, 322, 305, 288, 272, 257, 243, 230, 218, 206, 195, 185, 175, 165, 155, 145, 136].map((y, i) => (
            <path
              key={i}
              d={`M${96 + (i % 2) * 3} ${y} Q${104 + (i % 3)} ${y - 3} ${112 - (i % 2) * 3} ${y}`}
              fill="none" stroke="url(#palm-g)" strokeWidth="1.5" opacity="0.3"
            />
          ))}
          {/* Coconuts */}
          <circle cx="98" cy="123" r="6" fill="url(#palm-g)" opacity="0.6" />
          <circle cx="110" cy="121" r="5.5" fill="url(#palm-g)" opacity="0.6" />
          <circle cx="104" cy="116" r="5" fill="url(#palm-g)" opacity="0.55" />
          {/* === FRONDS — big lush filled leaves === */}
          {/* Far left — drooping low */}
          <path
            d="M103 120 C85 108 50 100 8 112
               C12 106 20 100 30 96
               C50 88 82 100 103 116Z"
            fill="url(#palm-g)"
          />
          {/* Left mid — reaching out */}
          <path
            d="M103 118 C80 96 45 72 5 62
               C12 58 25 56 38 58
               C62 64 88 90 103 114Z"
            fill="url(#palm-g)"
          />
          {/* Left upper — angled up */}
          <path
            d="M103 115 C88 86 62 50 28 22
               C38 20 48 24 58 32
               C78 50 96 84 103 112Z"
            fill="url(#palm-g)"
          />
          {/* Far right — drooping low */}
          <path
            d="M105 120 C123 108 158 100 200 112
               C196 106 188 100 178 96
               C158 88 126 100 105 116Z"
            fill="url(#palm-g)"
          />
          {/* Right mid — reaching out */}
          <path
            d="M105 118 C128 96 163 72 203 62
               C196 58 183 56 170 58
               C146 64 120 90 105 114Z"
            fill="url(#palm-g)"
          />
          {/* Right upper — angled up */}
          <path
            d="M105 115 C120 86 146 50 180 22
               C170 20 160 24 150 32
               C130 50 112 84 105 112Z"
            fill="url(#palm-g)"
          />
          {/* Top left frond */}
          <path
            d="M103 114 C96 80 82 42 62 6
               C70 8 78 16 84 28
               C94 52 100 84 103 110Z"
            fill="url(#palm-g)"
          />
          {/* Top right frond */}
          <path
            d="M105 114 C112 80 126 42 146 6
               C138 8 130 16 124 28
               C114 52 108 84 105 110Z"
            fill="url(#palm-g)"
          />
          {/* Center top frond */}
          <path
            d="M103 112 C102 76 100 40 104 4
               C108 40 106 76 105 112Z"
            fill="url(#palm-g)" opacity="0.9"
          />
          <defs>
            <linearGradient id="palm-g" x1="100" y1="0" x2="100" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D4A84B" />
              <stop offset="40%" stopColor="#C49A4C" />
              <stop offset="100%" stopColor="#8B7340" />
            </linearGradient>
          </defs>
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
