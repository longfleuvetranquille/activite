"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sun,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: Sun,
  },
  {
    href: "/today",
    label: "Aujourd'hui",
    icon: CalendarDays,
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
  {
    href: "/settings",
    label: "Parametres",
    icon: Settings,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="fr">
      <head>
        <title>Nice Outside</title>
        <meta
          name="description"
          content="Decouvre les meilleures activites a Nice et sur la Cote d'Azur"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased scrollbar-thin`}
      >
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <aside className="glass-nav fixed left-0 top-0 z-40 hidden h-full w-64 flex-col lg:flex">
            <SidebarContent pathname={pathname} onNavigate={() => {}} />
          </aside>

          {/* Mobile Header */}
          <header className="glass-header fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between px-4 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-coral-500 to-azur-500">
                <Sun className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Nice Outside
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-all hover:bg-azur-50 hover:text-azur-600 shadow-inner"
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
                  className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.aside
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="glass-nav fixed left-0 top-0 z-50 flex h-full w-72 flex-col shadow-lg lg:hidden"
                >
                  <SidebarContent
                    pathname={pathname}
                    onNavigate={() => setSidebarOpen(false)}
                  />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 pt-16 lg:pl-64 lg:pt-0">
            <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-6 lg:py-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
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
      <div className="flex h-16 items-center gap-3 border-b border-white/40 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-coral-500 to-azur-500 shadow-lg shadow-azur-500/20">
          <Sun className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Nice Outside</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            Cote d&apos;Azur
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
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
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-azur-50 text-azur-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] transition-colors ${
                  isActive
                    ? "text-azur-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-azur-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/40 px-5 py-4">
        <p className="text-xs text-slate-400">
          v0.1.0 &middot; Nice, France
        </p>
      </div>
    </>
  );
}
