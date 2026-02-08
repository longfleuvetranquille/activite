"use client";

import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

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
  { value: "", label: "Toutes les villes" },
  { value: "Nice", label: "Nice" },
  { value: "Monaco", label: "Monaco" },
  { value: "Cannes", label: "Cannes" },
  { value: "Antibes", label: "Antibes" },
  { value: "Menton", label: "Menton" },
];

const TYPES = [
  { value: "", label: "Tous les types" },
  { value: "party", label: "Soiree / Clubbing" },
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
  { value: "", label: "Toutes les vibes" },
  { value: "festive", label: "Festif" },
  { value: "chill", label: "Chill" },
  { value: "premium", label: "Premium" },
  { value: "dancing", label: "Dansant" },
  { value: "afterwork", label: "Afterwork" },
  { value: "sunset", label: "Sunset" },
  { value: "date", label: "Date-friendly" },
  { value: "friends", label: "Entre amis" },
  { value: "late_night", label: "Late night" },
];

const BUDGETS = [
  { value: "", label: "Tous les budgets" },
  { value: "free", label: "Gratuit" },
  { value: "budget", label: "Petit budget" },
  { value: "premium", label: "Premium" },
  { value: "value", label: "Bon rapport qualite/prix" },
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
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Toggle Filters Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary relative shrink-0 ${
            showFilters ? "border-azur-500/30 bg-azur-500/10" : ""
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-azur-500 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear all */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="btn-secondary shrink-0 text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Effacer</span>
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FilterSelect
            label="Ville"
            options={CITIES}
            value={filters.city || ""}
            onChange={(v) => updateFilter("city", v)}
          />
          <FilterSelect
            label="Type"
            options={TYPES}
            value={filters.type || ""}
            onChange={(v) => updateFilter("type", v)}
          />
          <FilterSelect
            label="Vibe"
            options={VIBES}
            value={filters.vibe || ""}
            onChange={(v) => updateFilter("vibe", v)}
          />
          <FilterSelect
            label="Budget"
            options={BUDGETS}
            value={filters.budget || ""}
            onChange={(v) => updateFilter("budget", v)}
          />
        </div>
      )}

      {/* Active Filters as Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.city && (
            <FilterChip
              label={`Ville: ${filters.city}`}
              onRemove={() => updateFilter("city", "")}
            />
          )}
          {filters.type && (
            <FilterChip
              label={`Type: ${TYPES.find((t) => t.value === filters.type)?.label || filters.type}`}
              onRemove={() => updateFilter("type", "")}
            />
          )}
          {filters.vibe && (
            <FilterChip
              label={`Vibe: ${VIBES.find((v) => v.value === filters.vibe)?.label || filters.vibe}`}
              onRemove={() => updateFilter("vibe", "")}
            />
          )}
          {filters.budget && (
            <FilterChip
              label={`Budget: ${BUDGETS.find((b) => b.value === filters.budget)?.label || filters.budget}`}
              onRemove={() => updateFilter("budget", "")}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
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
    <div className="space-y-1">
      <label className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field appearance-none cursor-pointer pr-8 text-xs"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#12121f]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-azur-500/10 px-3 py-1 text-xs font-medium text-azur-300">
      {label}
      <button
        onClick={onRemove}
        className="rounded-full p-0.5 transition-colors hover:bg-azur-500/20"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
