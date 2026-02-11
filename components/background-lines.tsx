// components/background-lines.tsx
"use client";

import { motion } from "framer-motion";

interface BackgroundLinesProps {
    variant?: "light" | "dark";
}

export const BackgroundLines = ({ variant = "light" }: BackgroundLinesProps) => {
    const lines = Array.from({ length: 8 }, (_, i) => i);
    const color = variant === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {lines.map((i) => (
                <motion.div
                    key={i}
                    className="absolute h-px w-full"
                    style={{
                        top: `${i * 15}%`,
                        left: 0,
                        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    }}
                    initial={{ x: "-100%", opacity: 0.3 }}
                    animate={{ x: "200%", opacity: 0.5 }}
                    transition={{
                        duration: 12 + i * 2,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "linear",
                    }}
                />
            ))}
            {lines.slice(0, 4).map((i) => (
                <motion.div
                    key={`v-${i}`}
                    className="absolute w-px h-full"
                    style={{
                        left: `${i * 25}%`,
                        top: 0,
                        background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
                    }}
                    initial={{ y: "-100%", opacity: 0.3 }}
                    animate={{ y: "200%", opacity: 0.5 }}
                    transition={{
                        duration: 15 + i * 1.5,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
};