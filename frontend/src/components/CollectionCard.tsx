"use client";

interface CollectionCardProps {
  emoji: string;
  title: string;
  description: string;
  count: number;
  href: string;
  gradient?: string;
}

export default function CollectionCard({
  emoji,
  title,
  description,
  count,
  href,
  gradient = "from-champagne-50 to-olive-50",
}: CollectionCardProps) {
  return (
    <a
      href={href}
      className={`group relative block aspect-[3/2] overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} border border-white/60 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated-lg`}
    >
      {/* Large background emoji */}
      <span className="absolute right-4 top-4 text-[120px] leading-none opacity-[0.06] transition-transform duration-700 group-hover:scale-110">
        {emoji}
      </span>

      {/* Content at bottom */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <h3 className="font-serif text-lg text-slate-900">{title}</h3>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
          {description}
        </p>
        <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {count} {count === 1 ? "spot" : "spots"}
        </p>
      </div>
    </a>
  );
}
