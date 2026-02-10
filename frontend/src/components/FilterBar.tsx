"use client";

import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Filters {
  city?: string;
  type?: string;
  vibe?: string;
  budget?: string;
  search?: string;
}

interface FilterBarProps {
  onFilter: (filters: Filters) => void;
}

const CITIES = [
  { value: "", label: "Toutes" },
  { value: "Cannes", label: "Cannes" },
  { value: "Nice", label: "Nice" },
  { value: "Monaco", label: "Monaco" },
  { value: "Antibes", label: "Antibes" },
  { value: "Saint-Tropez", label: "Saint-Tropez" },
  { value: "Mougins", label: "Mougins" },
];

const TYPES = [
  { value: "", label: "Tous" },
  { value: "party", label: "Soiree" },
  { value: "bar_rooftop", label: "Bar & Rooftop" },
  { value: "dj_set", label: "DJ set" },
  { value: "concert", label: "Concert" },
  { value: "show", label: "Spectacle" },
  { value: "conference", label: "Conference" },
  { value: "sport_match", label: "Sport" },
  { value: "outdoor", label: "Outdoor" },
  { value: "food", label: "Food" },
  { value: "travel", label: "Voyage" },
];

const VIBES = [
  { value: "", label: "Toutes" },
  { value: "festive", label: "Festif" },
  { value: "chill", label: "Chill" },
  { value: "premium", label: "Premium" },
  { value: "dancing", label: "Dansant" },
  { value: "afterwork", label: "Afterwork" },
  { value: "sunset", label: "Sunset" },
  { value: "date", label: "Date" },
  { value: "friends", label: "Entre amis" },
  { value: "late_night", label: "Late night" },
];

const BUDGETS = [
  { value: "", label: "Tous" },
  { value: "free", label: "Gratuit" },
  { value: "budget", label: "Petit budget" },
  { value: "premium", label: "Premium" },
  { value: "value", label: "Bon rapport Q/P" },
];

export default function FilterBar({ onFilter }: FilterBarProps) {
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = useCallback(
    (key: keyof Filters, value: string) => {
      const updated = { ...filters, [key]: value || undefined };
      setFilters(updated);
      onFilter(updated);
    },
    [filters, onFilter]
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    onFilter({});
  }, [onFilter]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search Row */}
      <div className="flex gap-3">
        {/* Search Input */}
        <div className="group relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-champagne-500" />
          <input
            type="text"
            placeholder="Rechercher un evenement..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="input-field pl-10"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Toggle Filters Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary relative shrink-0 ${
            showFilters ? "ring-2 ring-champagne-200 bg-champagne-50/80 text-champagne-700" : ""
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-champagne-500 text-[10px] font-bold text-white shadow-sm shadow-champagne-500/30">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear all */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="btn-secondary shrink-0 text-red-600 hover:text-red-500"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Effacer</span>
          </button>
        )}
      </div>

      {/* Filter Chip Rows */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              <FilterChipRow
                label="Ville"
                options={CITIES}
                value={filters.city || ""}
                onChange={(v) => updateFilter("city", v)}
              />
              <FilterChipRow
                label="Type"
                options={TYPES}
                value={filters.type || ""}
                onChange={(v) => updateFilter("type", v)}
              />
              <FilterChipRow
                label="Vibe"
                options={VIBES}
                value={filters.vibe || ""}
                onChange={(v) => updateFilter("vibe", v)}
              />
              <FilterChipRow
                label="Budget"
                options={BUDGETS}
                value={filters.budget || ""}
                onChange={(v) => updateFilter("budget", v)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChipRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-0.5">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-champagne-600 to-champagne-500 text-white shadow-md shadow-champagne-500/25"
                  : "bg-white/60 text-slate-600 ring-1 ring-white/80 backdrop-blur-sm hover:bg-white hover:text-slate-900 hover:shadow-sm"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
