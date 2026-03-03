"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, Ban, Check, Loader2 } from "lucide-react";

import type { Event, FeedbackRating } from "@/types";
import { submitFeedback } from "@/lib/api";

const ACTIONS: {
  rating: FeedbackRating;
  label: string;
  icon: typeof Star;
  bgActive: string;
  ring: string;
  bgIdle: string;
}[] = [
  {
    rating: "excellent",
    label: "Top",
    icon: Star,
    bgActive: "bg-champagne-100 text-champagne-700",
    ring: "ring-champagne-400",
    bgIdle: "bg-champagne-50/80 text-champagne-600 hover:bg-champagne-100/80",
  },
  {
    rating: "ok",
    label: "OK",
    icon: ThumbsUp,
    bgActive: "bg-slate-200 text-slate-700",
    ring: "ring-slate-400",
    bgIdle: "bg-slate-100/80 text-slate-500 hover:bg-slate-200/80",
  },
  {
    rating: "bad",
    label: "Nul",
    icon: ThumbsDown,
    bgActive: "bg-red-100 text-red-700",
    ring: "ring-red-400",
    bgIdle: "bg-red-50/80 text-red-500 hover:bg-red-100/80",
  },
  {
    rating: "block_type",
    label: "Bloquer ce type",
    icon: Ban,
    bgActive: "bg-red-200 text-red-800",
    ring: "ring-red-600",
    bgIdle: "bg-red-100/80 text-red-600 hover:bg-red-200/80",
  },
];

interface Props {
  event: Event;
  onFeedbackSubmit: (updatedEvent: Event) => void;
}

export default function FeedbackPanel({ event, onFeedbackSubmit }: Props) {
  const [selected, setSelected] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (rating: FeedbackRating) => {
    if (sent) return;
    setSelected(rating === selected ? null : rating);
    setConfirmBlock(false);
    setError(null);
  };

  const handleSend = async () => {
    if (!selected) return;

    // Block confirmation step
    if (selected === "block_type" && !confirmBlock) {
      setConfirmBlock(true);
      return;
    }

    setSending(true);
    setError(null);
    try {
      const updated = await submitFeedback(event.id, {
        rating: selected,
        comment,
      });
      setSent(true);
      onFeedbackSubmit(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-white/60 bg-white/60 p-6 text-center shadow-card backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
        >
          <Check className="h-6 w-6 text-green-600" />
        </motion.div>
        <p className="text-sm font-medium text-slate-700">Merci pour ton retour !</p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-card backdrop-blur-md">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Ton avis
      </h3>

      {/* 4 buttons */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const isActive = selected === action.rating;
          return (
            <button
              key={action.rating}
              onClick={() => handleSelect(action.rating)}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-medium transition-all ${
                isActive
                  ? `${action.bgActive} ring-2 ${action.ring}`
                  : action.bgIdle
              }`}
            >
              <Icon className="h-5 w-5" />
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Textarea + send */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                selected === "bad" || selected === "block_type"
                  ? "Pourquoi ? (aide a ameliorer les suggestions)"
                  : "Un commentaire ? (optionnel)"
              }
              rows={2}
              className="mt-3 w-full resize-none rounded-xl border border-black/[0.06] bg-white/80 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-champagne-300 focus:outline-none focus:ring-2 focus:ring-champagne-200"
            />

            {error && (
              <p className="mt-2 text-xs text-red-500">{error}</p>
            )}

            {/* Block confirmation warning */}
            <AnimatePresence>
              {confirmBlock && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
                >
                  Cet evenement sera annule et ce type d'activite sera bloque
                  dans tes preferences. Clique encore pour confirmer.
                </motion.p>
              )}
            </AnimatePresence>

            <button
              onClick={handleSend}
              disabled={sending}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-champagne-600 to-champagne-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-champagne-500/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : confirmBlock ? (
                "Confirmer le blocage"
              ) : (
                "Envoyer"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
