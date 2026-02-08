"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  Check,
  Clock,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Save,
  Settings,
  ShieldBan,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";

import type { UserPreferences, AllTags } from "@/types";
import { getPreferences, updatePreferences, getAllTags } from "@/lib/api";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences>({
    favorite_tags: [],
    blocked_tags: [],
    favorite_locations: [],
    max_budget: 0,
    telegram_chat_id: "",
    notif_time: "08:00",
    notif_enabled: true,
  });
  const [allTags, setAllTags] = useState<AllTags>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [prefsData, tagsData] = await Promise.all([
          getPreferences(),
          getAllTags(),
        ]);
        setPrefs(prefsData);
        setAllTags(tagsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      await updatePreferences(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (
    field: "favorite_tags" | "blocked_tags",
    tag: string
  ) => {
    setPrefs((prev) => {
      const current = prev[field];
      const updated = current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag];
      return { ...prev, [field]: updated };
    });
  };

  const toggleLocation = (loc: string) => {
    setPrefs((prev) => {
      const current = prev.favorite_locations;
      const updated = current.includes(loc)
        ? current.filter((l) => l !== loc)
        : [...current, loc];
      return { ...prev, favorite_locations: updated };
    });
  };

  const LOCATIONS = [
    "Nice",
    "Monaco",
    "Cannes",
    "Antibes",
    "Menton",
    "Grasse",
    "Saint-Tropez",
    "Villefranche-sur-Mer",
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-white/5" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-500/15">
          <Settings className="h-5 w-5 text-navy-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Parametres
          </h1>
          <p className="text-sm text-gray-500">Personnalise ton experience</p>
        </div>
      </div>

      {error && (
        <div className="card border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Favorite Tags */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-coral-400" />
          <h2 className="text-lg font-semibold text-white">Tags favoris</h2>
        </div>
        <p className="text-sm text-gray-500">
          Selectionne les tags qui t&apos;interessent pour booster le scoring
          des evenements correspondants.
        </p>
        {Object.entries(allTags).map(([category, tags]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(tags).map(([code, label]) => {
                const isSelected = prefs.favorite_tags.includes(code);
                return (
                  <button
                    key={code}
                    onClick={() => toggleTag("favorite_tags", code)}
                    className={`badge cursor-pointer transition-all ${
                      isSelected
                        ? "bg-coral-500/20 text-coral-300 ring-1 ring-coral-500/30"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Blocked Tags */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <ShieldBan className="h-5 w-5 text-red-400" />
          <h2 className="text-lg font-semibold text-white">Tags bloques</h2>
        </div>
        <p className="text-sm text-gray-500">
          Les evenements avec ces tags seront exclus de tes resultats.
        </p>
        {Object.entries(allTags).map(([category, tags]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(tags).map(([code, label]) => {
                const isBlocked = prefs.blocked_tags.includes(code);
                return (
                  <button
                    key={code}
                    onClick={() => toggleTag("blocked_tags", code)}
                    className={`badge cursor-pointer transition-all ${
                      isBlocked
                        ? "bg-red-500/20 text-red-300 ring-1 ring-red-500/30"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Favorite Locations */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-azur-400" />
          <h2 className="text-lg font-semibold text-white">
            Villes favorites
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((loc) => {
            const isSelected = prefs.favorite_locations.includes(loc);
            return (
              <button
                key={loc}
                onClick={() => toggleLocation(loc)}
                className={`badge cursor-pointer transition-all ${
                  isSelected
                    ? "bg-azur-500/20 text-azur-300 ring-1 ring-azur-500/30"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {loc}
              </button>
            );
          })}
        </div>
      </section>

      {/* Budget & Telegram */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Max Budget */}
        <section className="card space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Budget max</h2>
          </div>
          <p className="text-sm text-gray-500">
            Budget maximum par evenement (en EUR). 0 = pas de limite.
          </p>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="5"
              value={prefs.max_budget}
              onChange={(e) =>
                setPrefs({ ...prefs, max_budget: Number(e.target.value) })
              }
              className="input-field pr-12"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              EUR
            </span>
          </div>
        </section>

        {/* Telegram */}
        <section className="card space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Telegram</h2>
          </div>
          <p className="text-sm text-gray-500">
            Chat ID pour recevoir les notifications quotidiennes.
          </p>
          <input
            type="text"
            value={prefs.telegram_chat_id}
            onChange={(e) =>
              setPrefs({ ...prefs, telegram_chat_id: e.target.value })
            }
            className="input-field"
            placeholder="123456789"
          />
        </section>
      </div>

      {/* Notifications */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {prefs.notif_enabled ? (
              <Bell className="h-5 w-5 text-azur-400" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-500" />
            )}
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
          </div>
          <button
            onClick={() =>
              setPrefs({ ...prefs, notif_enabled: !prefs.notif_enabled })
            }
            className={`relative h-7 w-12 rounded-full transition-colors ${
              prefs.notif_enabled ? "bg-azur-600" : "bg-gray-700"
            }`}
          >
            <div
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                prefs.notif_enabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {prefs.notif_enabled && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-400">
                Heure de notification
              </span>
            </div>
            <input
              type="time"
              value={prefs.notif_time}
              onChange={(e) =>
                setPrefs({ ...prefs, notif_time: e.target.value })
              }
              className="input-field max-w-xs"
            />
          </div>
        )}
      </section>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary min-w-[160px]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              Sauvegarde !
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Sauvegarder
            </>
          )}
        </button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-emerald-400"
          >
            Preferences mises a jour
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
