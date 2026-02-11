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
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {/* Dashboard */}
        <NavGroup label="Dashboard" items={NAV_DASHBOARD} pathname={pathname} onNavigate={onNavigate} />

        {/* Par periode */}
        <NavGroup label="Par periode" items={NAV_PERIOD} pathname={pathname} onNavigate={onNavigate} />

        {/* Type d'activite */}
        <NavGroup label="Type d'activite" items={NAV_ACTIVITIES} pathname={pathname} onNavigate={onNavigate} isAnchor />
      </nav>

      {/* Decorative palm tree — Côte d'Azur silhouette */}
      <div className="hidden lg:flex flex-1 items-end justify-center overflow-hidden min-h-0">
        <svg
          viewBox="0 0 200 520"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full max-h-[460px] w-auto"
          style={{ opacity: 0.14 }}
        >
          {/* Trunk — gentle S-curve, tapered */}
          <path
            d="M96 505 C94 465 92 400 93 345 C95 290 97 240 97 195
               C97 178 97 167 97 162"
            fill="none" stroke="url(#pt)" strokeWidth="12" strokeLinecap="round"
          />
          <path
            d="M96 505 C94 465 92 400 93 345 C95 290 97 240 97 195
               C97 178 97 167 97 162"
            fill="none" stroke="url(#pt-hi)" strokeWidth="4" strokeLinecap="round" opacity="0.15"
          />
          {/* Bark rings */}
          {Array.from({ length: 28 }, (_, i) => {
            const t = i / 27;
            const y = 498 - t * 340;
            const x = 96 + Math.sin(t * 3) * 2.5 - t * 1;
            const w = 6.5 - t * 1.5;
            return (
              <path
                key={`b-${i}`}
                d={`M${x - w} ${y} Q${x} ${y - 1.5} ${x + w} ${y}`}
                fill="none" stroke="url(#pt)" strokeWidth="0.5" opacity={0.12}
              />
            );
          })}
          {/* Coconuts */}
          <ellipse cx="94" cy="160" rx="4.5" ry="5" fill="url(#pc)" />
          <ellipse cx="102" cy="158" rx="4" ry="4.5" fill="url(#pc)" />
          <ellipse cx="98" cy="155" rx="3.5" ry="4" fill="url(#pc)" />
          {/* ——— Filled fronds — Côte d'Azur palm silhouette ——— */}
          {(() => {
            const ox = 98, oy = 158;
            const fronds = [
              // Back layer (lower opacity = depth)
              { a: -168, l: 138, d: 52, w: 8,  o: 0.38 },
              { a: -128, l: 148, d: 28, w: 9,  o: 0.42 },
              { a: -95,  l: 132, d: 10, w: 8,  o: 0.38 },
              { a: 168,  l: 134, d: 50, w: 8,  o: 0.38 },
              { a: 128,  l: 145, d: 26, w: 9,  o: 0.42 },
              { a: 95,   l: 130, d: 8,  w: 8,  o: 0.38 },
              // Front layer
              { a: -160, l: 144, d: 48, w: 9,  o: 0.7 },
              { a: -138, l: 158, d: 36, w: 10, o: 0.78 },
              { a: -112, l: 148, d: 20, w: 9,  o: 0.72 },
              { a: -82,  l: 130, d: 7,  w: 8,  o: 0.65 },
              { a: -55,  l: 114, d: 1,  w: 7,  o: 0.6 },
              { a: 160,  l: 140, d: 46, w: 9,  o: 0.7 },
              { a: 138,  l: 155, d: 34, w: 10, o: 0.78 },
              { a: 112,  l: 146, d: 18, w: 9,  o: 0.72 },
              { a: 82,   l: 128, d: 5,  w: 8,  o: 0.65 },
              { a: 55,   l: 110, d: 0,  w: 7,  o: 0.6 },
              // Top cluster
              { a: -28,  l: 98,  d: 0,  w: 6.5, o: 0.55 },
              { a: 28,   l: 94,  d: 0,  w: 6.5, o: 0.55 },
              { a: -5,   l: 82,  d: 0,  w: 6,  o: 0.5 },
              { a: 10,   l: 78,  d: 0,  w: 6,  o: 0.5 },
            ];
            const els: React.ReactElement[] = [];
            fronds.forEach((f, i) => {
              const rad = (f.a * Math.PI) / 180;
              const cos = Math.cos(rad), sin = Math.sin(rad);
              const nx = -sin, ny = cos;
              // Crown attachment points
              const s1x = ox + nx * f.w * 0.25, s1y = oy + ny * f.w * 0.25;
              const s2x = ox - nx * f.w * 0.25, s2y = oy - ny * f.w * 0.25;
              // Tip
              const tx = ox + cos * f.l, ty = oy + sin * f.l + f.d;
              // Outer edge cubic bezier controls
              const oc1x = ox + cos * f.l * 0.3 + nx * f.w * 0.85;
              const oc1y = oy + sin * f.l * 0.3 + ny * f.w * 0.85 + f.d * 0.06;
              const oc2x = ox + cos * f.l * 0.65 + nx * f.w * 0.45;
              const oc2y = oy + sin * f.l * 0.65 + ny * f.w * 0.45 + f.d * 0.45;
              // Inner edge cubic bezier controls
              const ic1x = ox + cos * f.l * 0.65 - nx * f.w * 0.45;
              const ic1y = oy + sin * f.l * 0.65 - ny * f.w * 0.45 + f.d * 0.45;
              const ic2x = ox + cos * f.l * 0.3 - nx * f.w * 0.85;
              const ic2y = oy + sin * f.l * 0.3 - ny * f.w * 0.85 + f.d * 0.06;
              // Filled frond shape
              els.push(
                <path
                  key={`f-${i}`}
                  d={`M${s1x} ${s1y} C${oc1x} ${oc1y} ${oc2x} ${oc2y} ${tx} ${ty} C${ic1x} ${ic1y} ${ic2x} ${ic2y} ${s2x} ${s2y} Z`}
                  fill="url(#pf)"
                  opacity={f.o}
                />
              );
              // Central spine on front-layer fronds
              if (f.o >= 0.55) {
                els.push(
                  <path
                    key={`sp-${i}`}
                    d={`M${ox} ${oy} C${ox + cos * f.l * 0.35} ${oy + sin * f.l * 0.35 + f.d * 0.08} ${ox + cos * f.l * 0.7} ${oy + sin * f.l * 0.7 + f.d * 0.5} ${tx} ${ty}`}
                    fill="none" stroke="url(#pf)" strokeWidth="0.7" opacity="0.25" strokeLinecap="round"
                  />
                );
              }
            });
            return els;
          })()}
          <defs>
            <linearGradient id="pt" x1="97" y1="160" x2="97" y2="510" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C49A4C" />
              <stop offset="100%" stopColor="#5C4E30" />
            </linearGradient>
            <linearGradient id="pt-hi" x1="97" y1="160" x2="97" y2="510" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E8C97A" />
              <stop offset="100%" stopColor="#C49A4C" />
            </linearGradient>
            <linearGradient id="pf" x1="100" y1="0" x2="100" y2="320" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D4AA50" />
              <stop offset="40%" stopColor="#C49A4C" />
              <stop offset="100%" stopColor="#7A6535" />
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
