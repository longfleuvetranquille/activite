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

      {/* Decorative palm tree — realistic pinnate coconut palm */}
      <div className="flex flex-1 items-end justify-center overflow-hidden">
        <svg
          viewBox="0 0 300 580"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full max-h-[460px] w-auto"
          style={{ opacity: 0.13 }}
        >
          {/* Trunk — graceful curve with taper */}
          <path
            d="M142 570 C140 535 137 500 138 465 C140 425 147 388 152 350
               C156 312 155 278 153 245 C151 215 149 190 150 165"
            fill="none" stroke="url(#pt)" strokeWidth="14" strokeLinecap="round"
          />
          {/* Trunk inner highlight */}
          <path
            d="M142 570 C140 535 137 500 138 465 C140 425 147 388 152 350
               C156 312 155 278 153 245 C151 215 149 190 150 165"
            fill="none" stroke="url(#pt-hi)" strokeWidth="5" strokeLinecap="round" opacity="0.12"
          />
          {/* Bark rings */}
          {Array.from({ length: 36 }, (_, i) => {
            const t = i / 35;
            const y = 560 - t * 400;
            const x = 142 + Math.sin(t * 3.5) * 11 - t * 1;
            const w = 7.5 - t * 2;
            return (
              <path
                key={`bark-${i}`}
                d={`M${x - w} ${y} Q${x} ${y - 1.8} ${x + w} ${y}`}
                fill="none" stroke="url(#pt)" strokeWidth="0.6" opacity={0.12 + (i % 2) * 0.06}
              />
            );
          })}
          {/* Coconut cluster */}
          <ellipse cx="146" cy="163" rx="5.5" ry="6" fill="url(#pc)" />
          <ellipse cx="155" cy="161" rx="5" ry="5.5" fill="url(#pc)" />
          <ellipse cx="150" cy="157" rx="4.5" ry="5" fill="url(#pc)" />
          {/* ——— Pinnate fronds with cubic bezier rachis & true-perpendicular leaflets ——— */}
          {(() => {
            // Crown origin
            const ox = 150, oy = 160;

            // Each frond: angle (degrees from up), length, gravity droop, leaflet count
            const fronds = [
              // Left side — heavy droop on outermost
              { a: -165, len: 145, droop: 55, lc: 15 },
              { a: -140, len: 160, droop: 42, lc: 16 },
              { a: -115, len: 150, droop: 25, lc: 15 },
              { a: -88,  len: 135, droop: 12, lc: 14 },
              { a: -60,  len: 120, droop: 4,  lc: 12 },
              // Right side — mirror
              { a: 165,  len: 140, droop: 52, lc: 15 },
              { a: 140,  len: 155, droop: 40, lc: 16 },
              { a: 115,  len: 148, droop: 22, lc: 15 },
              { a: 88,   len: 130, droop: 10, lc: 13 },
              { a: 60,   len: 118, droop: 3,  lc: 12 },
              // Top cluster — upright, shorter
              { a: -30,  len: 105, droop: 0,  lc: 11 },
              { a: 30,   len: 100, droop: 0,  lc: 11 },
              { a: 5,    len: 88,  droop: 0,  lc: 10 },
            ];

            const els: React.ReactElement[] = [];

            fronds.forEach((f, fi) => {
              const rad = (f.a * Math.PI) / 180;
              const c = Math.cos(rad), s = Math.sin(rad);

              // Cubic bezier control points for rachis
              // P0: crown, P1: initial direction, P2: midway + gravity, P3: tip + full droop
              const p0x = ox, p0y = oy;
              const p1x = ox + c * f.len * 0.35, p1y = oy + s * f.len * 0.35 + f.droop * 0.05;
              const p2x = ox + c * f.len * 0.7,  p2y = oy + s * f.len * 0.7 + f.droop * 0.55;
              const p3x = ox + c * f.len,         p3y = oy + s * f.len + f.droop;

              // Rachis stroke
              els.push(
                <path
                  key={`rc-${fi}`}
                  d={`M${p0x} ${p0y} C${p1x} ${p1y} ${p2x} ${p2y} ${p3x} ${p3y}`}
                  fill="none" stroke="url(#pf)" strokeWidth="2.2" strokeLinecap="round" opacity="0.85"
                />
              );

              // Leaflets along the rachis
              for (let li = 1; li <= f.lc; li++) {
                const t = li / (f.lc + 1);
                const mt = 1 - t;

                // Point on cubic bezier at parameter t
                const bx = mt*mt*mt*p0x + 3*mt*mt*t*p1x + 3*mt*t*t*p2x + t*t*t*p3x;
                const by = mt*mt*mt*p0y + 3*mt*mt*t*p1y + 3*mt*t*t*p2y + t*t*t*p3y;

                // Tangent vector (derivative of cubic bezier)
                const dx = 3*mt*mt*(p1x-p0x) + 6*mt*t*(p2x-p1x) + 3*t*t*(p3x-p2x);
                const dy = 3*mt*mt*(p1y-p0y) + 6*mt*t*(p2y-p1y) + 3*t*t*(p3y-p2y);
                const dLen = Math.sqrt(dx*dx + dy*dy) || 1;

                // Normal (perpendicular to tangent)
                const nx = -dy / dLen, ny = dx / dLen;

                // Leaflet length: bell-curve distribution, peak at ~40% of rachis
                const leafLen = (18 + 16 * Math.sin(t * Math.PI * 0.95)) * (1 - t * 0.2);
                const sw = 1.3 - t * 0.4; // stroke width tapers
                const op = 0.72 - t * 0.15; // opacity fades toward tip

                // Left leaflet — slight gravity droop
                const llTipX = bx + nx * leafLen;
                const llTipY = by + ny * leafLen + leafLen * 0.12;
                els.push(
                  <path
                    key={`ll-${fi}-${li}`}
                    d={`M${bx} ${by} Q${bx + nx * leafLen * 0.55} ${by + ny * leafLen * 0.55 + leafLen * 0.04} ${llTipX} ${llTipY}`}
                    fill="none" stroke="url(#pf)" strokeWidth={sw} strokeLinecap="round" opacity={op}
                  />
                );

                // Right leaflet
                const rlTipX = bx - nx * leafLen;
                const rlTipY = by - ny * leafLen + leafLen * 0.12;
                els.push(
                  <path
                    key={`rl-${fi}-${li}`}
                    d={`M${bx} ${by} Q${bx - nx * leafLen * 0.55} ${by - ny * leafLen * 0.55 + leafLen * 0.04} ${rlTipX} ${rlTipY}`}
                    fill="none" stroke="url(#pf)" strokeWidth={sw} strokeLinecap="round" opacity={op}
                  />
                );
              }
            });

            return els;
          })()}
          <defs>
            <linearGradient id="pt" x1="148" y1="160" x2="148" y2="580" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C49A4C" />
              <stop offset="100%" stopColor="#5C4E30" />
            </linearGradient>
            <linearGradient id="pt-hi" x1="148" y1="160" x2="148" y2="580" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E8C97A" />
              <stop offset="100%" stopColor="#C49A4C" />
            </linearGradient>
            <linearGradient id="pf" x1="150" y1="20" x2="150" y2="320" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D4AA50" />
              <stop offset="40%" stopColor="#C49A4C" />
              <stop offset="100%" stopColor="#8B7340" />
            </linearGradient>
            <radialGradient id="pc" cx="40%" cy="30%">
              <stop offset="0%" stopColor="#D4AA50" />
              <stop offset="100%" stopColor="#6B5D3E" />
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
