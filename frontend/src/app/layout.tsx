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

      {/* Decorative palm tree — filled silhouette */}
      <div className="flex flex-1 items-end justify-center overflow-hidden px-4 pb-4">
        <svg
          viewBox="0 0 120 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-auto w-28 opacity-[0.07]"
        >
          {/* Trunk — gentle S-curve */}
          <path
            d="M58 270 C57 250 54 225 55 200 C56 175 62 150 61 128 C60 115 59 105 59 95"
            stroke="url(#palm-g)" strokeWidth="8" strokeLinecap="round"
          />
          {/* Trunk notches */}
          {[240, 222, 205, 190, 176, 163, 151, 140, 130, 120, 111].map((y, i) => (
            <path
              key={i}
              d={`M${54 + (i % 2) * 2} ${y} Q59 ${y - 2} ${64 - (i % 2) * 2} ${y}`}
              stroke="url(#palm-g)" strokeWidth="1.2" opacity="0.35"
            />
          ))}
          {/* Coconut cluster */}
          <ellipse cx="56" cy="94" rx="4.5" ry="4" fill="url(#palm-g)" opacity="0.5" />
          <ellipse cx="63" cy="93" rx="4" ry="3.5" fill="url(#palm-g)" opacity="0.5" />
          <ellipse cx="59" cy="89" rx="3.5" ry="3.5" fill="url(#palm-g)" opacity="0.5" />
          {/* Fronds — filled leaf shapes */}
          {/* Left drooping frond */}
          <path
            d="M59 90 C48 78 28 68 4 72 C28 64 48 72 59 88Z"
            fill="url(#palm-g)" opacity="0.85"
          />
          {/* Left mid frond */}
          <path
            d="M59 88 C44 68 20 50 0 44 C22 44 46 62 59 85Z"
            fill="url(#palm-g)" opacity="0.9"
          />
          {/* Left upper frond */}
          <path
            d="M59 86 C48 62 30 35 10 18 C32 28 50 55 59 82Z"
            fill="url(#palm-g)" opacity="0.8"
          />
          {/* Right drooping frond */}
          <path
            d="M61 90 C72 78 92 68 116 72 C92 64 72 72 61 88Z"
            fill="url(#palm-g)" opacity="0.85"
          />
          {/* Right mid frond */}
          <path
            d="M61 88 C76 68 100 50 120 44 C98 44 74 62 61 85Z"
            fill="url(#palm-g)" opacity="0.9"
          />
          {/* Right upper frond */}
          <path
            d="M61 86 C72 62 90 35 110 18 C88 28 70 55 61 82Z"
            fill="url(#palm-g)" opacity="0.8"
          />
          {/* Top fronds */}
          <path
            d="M59 86 C56 60 50 32 42 6 C52 28 58 58 60 84Z"
            fill="url(#palm-g)" opacity="0.75"
          />
          <path
            d="M61 86 C64 60 70 32 78 6 C68 28 62 58 60 84Z"
            fill="url(#palm-g)" opacity="0.75"
          />
          <path
            d="M60 85 C59 55 58 28 60 0 C62 28 61 55 60 85Z"
            fill="url(#palm-g)" opacity="0.7"
          />
          <defs>
            <linearGradient id="palm-g" x1="60" y1="0" x2="60" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C49A4C" />
              <stop offset="50%" stopColor="#B8904A" />
              <stop offset="100%" stopColor="#6B5D3E" />
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
