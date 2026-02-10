"use client";

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Orb 1 — top-left azur */}
      <div
        className="absolute -left-[10%] -top-[10%] h-[600px] w-[600px] animate-mesh-drift-1 rounded-full opacity-[0.15]"
        style={{
          background:
            "radial-gradient(circle, rgba(27,109,245,0.5) 0%, transparent 70%)",
        }}
      />
      {/* Orb 2 — bottom-right coral */}
      <div
        className="absolute -bottom-[15%] -right-[10%] h-[500px] w-[500px] animate-mesh-drift-2 rounded-full opacity-[0.12]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,107,44,0.45) 0%, transparent 70%)",
        }}
      />
      {/* Orb 3 — center navy */}
      <div
        className="absolute left-[30%] top-[40%] h-[450px] w-[450px] animate-mesh-drift-3 rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, rgba(99,96,241,0.5) 0%, transparent 70%)",
        }}
      />
      {/* Orb 4 — top-right warm */}
      <div
        className="absolute -right-[5%] -top-[5%] h-[400px] w-[400px] animate-mesh-drift-4 rounded-full opacity-[0.1]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,140,66,0.4) 0%, transparent 70%)",
        }}
      />
      {/* Subtle grid overlay */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
