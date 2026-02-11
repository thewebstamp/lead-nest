// components/background-lines.tsx
"use client";

interface BackgroundLinesProps {
    variant?: "light" | "dark";
}

interface BackgroundLinesProps {
    variant?: "light" | "dark";
}

export const BackgroundLines = ({ variant = "light" }: BackgroundLinesProps) => {
    const color = variant === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute h-px w-full animate-slide-x"
                    style={{
                        top: `${i * 15}%`,
                        left: 0,
                        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                        animationDelay: `${i * 0.8}s`,
                        animationDuration: `${12 + i * 2}s`,
                    }}
                />
            ))}
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={`v-${i}`}
                    className="absolute w-px h-full animate-slide-y"
                    style={{
                        left: `${i * 25}%`,
                        top: 0,
                        background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
                        animationDelay: `${i * 0.6}s`,
                        animationDuration: `${15 + i * 1.5}s`,
                    }}
                />
            ))}
        </div>
    );
};