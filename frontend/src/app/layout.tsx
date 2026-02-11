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
            const isActive = pathname === item.href;
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
      <div className="flex flex-1 items-end justify-center overflow-hidden">
        <svg
          viewBox="0 0 260 520"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full max-h-[420px] w-auto opacity-[0.12]"
        >
          {/* Trunk — tapered with slight lean */}
          <path
            d="M128 510 Q126 480 127 450 Q130 400 134 355 Q137 310 135 270
               Q133 235 132 205 Q131 180 131 160"
            fill="none" stroke="url(#palm-trunk)" strokeWidth="16" strokeLinecap="round"
          />
          <path
            d="M128 510 Q126 480 127 450 Q130 400 134 355 Q137 310 135 270
               Q133 235 132 205 Q131 180 131 160"
            fill="none" stroke="url(#palm-trunk)" strokeWidth="10" strokeLinecap="round" opacity="0.3"
          />
          {/* Trunk segments — curved bark lines */}
          {[480, 458, 437, 418, 400, 383, 367, 352, 338, 325, 312, 300, 289, 278, 268, 258, 249, 240, 232, 224, 217, 210, 203, 197, 191, 185, 179, 174, 169].map((y, i) => {
            const xOff = Math.sin(i * 0.3) * 1.5;
            const trunkX = 128 + (y < 350 ? (350 - y) * 0.012 : (y - 350) * -0.006);
            return (
              <path
                key={i}
                d={`M${trunkX - 7 + xOff} ${y} Q${trunkX + xOff} ${y - 2.5} ${trunkX + 7 + xOff} ${y}`}
                fill="none" stroke="url(#palm-trunk)" strokeWidth="0.8" opacity={0.2 + (i % 3) * 0.05}
              />
            );
          })}
          {/* Coconuts */}
          <ellipse cx="126" cy="157" rx="6.5" ry="6" fill="url(#palm-coconut)" />
          <ellipse cx="137" cy="155" rx="6" ry="5.5" fill="url(#palm-coconut)" />
          <ellipse cx="131" cy="150" rx="5.5" ry="5" fill="url(#palm-coconut)" />
          {/* ——— FRONDS ——— */}
          {/* Each frond: filled leaf with serrated edge via multiple curves */}
          {/* LEFT — drooping far */}
          <path d="M130 155 C118 148 85 142 40 152 C42 146 48 140 58 137 C80 130 112 138 130 150Z" fill="url(#palm-frond)" />
          <path d="M130 155 C108 148 68 145 18 158 C22 150 30 144 42 140 C68 132 108 138 130 150Z" fill="url(#palm-frond)" opacity="0.7" />
          {/* LEFT — mid reach */}
          <path d="M130 152 C112 134 72 108 16 92 C22 86 34 82 48 84 C78 90 112 118 130 146Z" fill="url(#palm-frond)" />
          <path d="M130 152 C108 130 62 100 8 80 C14 76 26 74 40 76 C70 82 108 114 130 144Z" fill="url(#palm-frond)" opacity="0.65" />
          {/* LEFT — upper */}
          <path d="M130 148 C118 120 90 78 50 38 C58 34 68 36 76 42 C98 62 120 104 130 142Z" fill="url(#palm-frond)" />
          <path d="M130 148 C116 116 84 68 38 24 C48 22 58 26 66 34 C90 56 118 100 130 140Z" fill="url(#palm-frond)" opacity="0.6" />
          {/* RIGHT — drooping far */}
          <path d="M134 155 C146 148 179 142 224 152 C222 146 216 140 206 137 C184 130 152 138 134 150Z" fill="url(#palm-frond)" />
          <path d="M134 155 C156 148 196 145 246 158 C242 150 234 144 222 140 C196 132 156 138 134 150Z" fill="url(#palm-frond)" opacity="0.7" />
          {/* RIGHT — mid reach */}
          <path d="M134 152 C152 134 192 108 248 92 C242 86 230 82 216 84 C186 90 152 118 134 146Z" fill="url(#palm-frond)" />
          <path d="M134 152 C156 130 202 100 256 80 C250 76 238 74 224 76 C194 82 156 114 134 144Z" fill="url(#palm-frond)" opacity="0.65" />
          {/* RIGHT — upper */}
          <path d="M134 148 C146 120 174 78 214 38 C206 34 196 36 188 42 C166 62 144 104 134 142Z" fill="url(#palm-frond)" />
          <path d="M134 148 C148 116 180 68 226 24 C216 22 206 26 198 34 C174 56 146 100 134 140Z" fill="url(#palm-frond)" opacity="0.6" />
          {/* TOP — left lean */}
          <path d="M130 146 C124 110 110 66 88 16 C96 14 104 20 110 32 C122 60 128 106 130 140Z" fill="url(#palm-frond)" />
          <path d="M130 146 C122 106 104 56 76 4 C84 4 92 12 100 26 C116 56 126 102 130 138Z" fill="url(#palm-frond)" opacity="0.55" />
          {/* TOP — right lean */}
          <path d="M134 146 C140 110 154 66 176 16 C168 14 160 20 154 32 C142 60 136 106 134 140Z" fill="url(#palm-frond)" />
          <path d="M134 146 C142 106 160 56 188 4 C180 4 172 12 164 26 C148 56 138 102 134 138Z" fill="url(#palm-frond)" opacity="0.55" />
          {/* TOP — center */}
          <path d="M130 142 C129 100 128 55 132 6 C136 55 135 100 134 142Z" fill="url(#palm-frond)" opacity="0.5" />
          {/* Frond spines — thin central veins */}
          <path d="M131 156 C110 140 60 128 14 154" fill="none" stroke="url(#palm-frond)" strokeWidth="0.7" opacity="0.3" />
          <path d="M131 152 C108 128 55 96 10 82" fill="none" stroke="url(#palm-frond)" strokeWidth="0.7" opacity="0.3" />
          <path d="M131 148 C112 110 78 60 44 28" fill="none" stroke="url(#palm-frond)" strokeWidth="0.7" opacity="0.3" />
          <path d="M133 156 C154 140 204 128 250 154" fill="none" stroke="url(#palm-frond)" strokeWidth="0.7" opacity="0.3" />
          <path d="M133 152 C156 128 209 96 254 82" fill="none" stroke="url(#palm-frond)" strokeWidth="0.7" opacity="0.3" />
          <path d="M133 148 C152 110 186 60 220 28" fill="none" stroke="url(#palm-frond)" strokeWidth="0.7" opacity="0.3" />
          <path d="M131 144 C126 100 108 52 82 8" fill="none" stroke="url(#palm-frond)" strokeWidth="0.7" opacity="0.25" />
          <path d="M133 144 C138 100 156 52 182 8" fill="none" stroke="url(#palm-frond)" strokeWidth="0.7" opacity="0.25" />
          <defs>
            <linearGradient id="palm-trunk" x1="130" y1="140" x2="130" y2="520" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#B8904A" />
              <stop offset="100%" stopColor="#6B5D3E" />
            </linearGradient>
            <linearGradient id="palm-frond" x1="130" y1="0" x2="130" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D4AA50" />
              <stop offset="100%" stopColor="#A8884A" />
            </linearGradient>
            <radialGradient id="palm-coconut" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#C49A4C" />
              <stop offset="100%" stopColor="#7A6535" />
            </radialGradient>
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
