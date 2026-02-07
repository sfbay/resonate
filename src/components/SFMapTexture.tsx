"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Thomas Bros. Map Texture Component
 *
 * Displays a random punch-out from the 1938 Thomas Bros. Map of San Francisco
 * as a subtle background texture for hero sections.
 *
 * Source: David Rumsey Map Collection
 */

// Available map punch-outs - each shows a different SF neighborhood
const MAP_PUNCHOUTS = [
  { name: "downtown", description: "Downtown" },
  { name: "mission", description: "The Mission" },
  { name: "sunset", description: "The Sunset" },
  { name: "richmond", description: "The Richmond" },
  { name: "castro", description: "The Castro" },
  { name: "bayview", description: "Bayview-Hunters Point" },
  { name: "presidio", description: "The Presidio" },
  { name: "golden-gate-park", description: "Golden Gate Park" },
];

interface SFMapTextureProps {
  className?: string;
  variant?: "coral" | "teal" | "marigold";
}

export function SFMapTexture({ className = "", variant = "coral" }: SFMapTextureProps) {
  const [mounted, setMounted] = useState(false);
  const [punchout, setPunchout] = useState(MAP_PUNCHOUTS[0]);
  const [transform, setTransform] = useState({ scale: 1.15, x: 0, y: 0, rotate: 0 });

  useEffect(() => {
    // Pick a random punch-out on mount
    const randomIndex = Math.floor(Math.random() * MAP_PUNCHOUTS.length);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPunchout(MAP_PUNCHOUTS[randomIndex]);

    // Random subtle transform for variety
    setTransform({
      scale: 1.1 + Math.random() * 0.15, // 1.1 to 1.25
      x: (Math.random() - 0.5) * 10, // -5% to 5%
      y: (Math.random() - 0.5) * 10, // -5% to 5%
      rotate: (Math.random() - 0.5) * 4, // -2 to 2 degrees
    });

    setMounted(true);
  }, []);

  // Blend mode and opacity based on variant - subtle, barely visible
  const blendStyle = variant === "coral"
    ? { mixBlendMode: "multiply" as const, opacity: 0.12 }
    : variant === "marigold"
    ? { mixBlendMode: "multiply" as const, opacity: 0.10 }
    : { mixBlendMode: "multiply" as const, opacity: 0.15 };

  if (!mounted) return null;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Map image with vintage texture effect */}
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${transform.scale}) translate(${transform.x}%, ${transform.y}%) rotate(${transform.rotate}deg)`,
          ...blendStyle,
        }}
      >
        <Image
          src={`/images/map-textures/${punchout.name}.jpg`}
          alt=""
          fill
          className="object-cover"
          style={{
            filter: "contrast(1.1) brightness(1.05)",
          }}
          priority={false}
          sizes="100vw"
        />
      </div>

      {/* Subtle vignette overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, ${
            variant === "coral" ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.12)"
          } 100%)`,
        }}
      />

    </div>
  );
}
