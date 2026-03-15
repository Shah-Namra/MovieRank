"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface MoviePosterProps {
  title: string;
  year: number;
  posterPath: string | null;
  rating: number;
  onClick?: () => void;
  disabled?: boolean;
  position?: "left" | "right";
  compact?: boolean;
  selectionState?: "winner" | "loser" | null;
}

export function MoviePoster({
  title,
  year,
  posterPath,
  rating,
  onClick,
  disabled = false,
  position = "left",
  compact = false,
  selectionState = null,
}: MoviePosterProps) {
  const imageUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
  const isWinner = selectionState === "winner";
  const isLoser  = selectionState === "loser";
  const anySelected = selectionState !== null;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || anySelected}
      className="group relative focus:outline-none"
      style={{ width: 210 }}
      initial={{ opacity: 0, x: position === "left" ? -20 : 20 }}
      animate={{
        opacity: isLoser ? 0.22 : 1,
        x: 0,
        filter: isLoser ? "grayscale(1) brightness(0.4)" : "grayscale(0) brightness(1)",
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      whileHover={!disabled && !anySelected ? { y: -8, transition: { duration: 0.22, ease: "easeOut" } } : {}}
      whileTap={!disabled && !anySelected ? { scale: 0.975 } : {}}
    >
      {/* ── Poster frame ── */}
      <div
        className="relative overflow-hidden w-full"
        style={{
          aspectRatio: "2/3",
          background: "var(--surface-2)",
          /* Thin inset border that doesn't affect layout */
          boxShadow: isWinner
            ? "0 0 0 1.5px var(--gold), 0 0 36px var(--gold-glow)"
            : "0 0 0 1px var(--border)",
          transition: "box-shadow 0.25s ease",
        }}
      >
        {/* Corner accent — top-left for left poster, top-right for right */}
        <div
          style={{
            position: "absolute",
            top: 0,
            [position === "left" ? "left" : "right"]: 0,
            width: 24,
            height: 24,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div style={{
            position: "absolute", top: 0,
            [position === "left" ? "left" : "right"]: 0,
            width: "100%", height: 1.5,
            background: isWinner ? "var(--gold)" : "var(--gold)",
            opacity: isWinner ? 1 : 0.7,
          }}/>
          <div style={{
            position: "absolute", top: 0,
            [position === "left" ? "left" : "right"]: 0,
            width: 1.5, height: "100%",
            background: "var(--gold)",
            opacity: isWinner ? 1 : 0.7,
          }}/>
        </div>

        {/* Poster image */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 85vw, 240px"
            priority
            quality={88}
          />
        ) : (
          <div
            className="flex items-center justify-center h-full"
            style={{ background: "var(--surface-2)" }}
          >
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              style={{ color: "var(--text-muted)" }}>
              <rect x="2" y="3" width="20" height="18" rx="0" strokeWidth={0.75}/>
              <path d="M7 3v18M17 3v18M2 9h20M2 15h20" strokeWidth={0.75}/>
            </svg>
          </div>
        )}

        {/* Bottom gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.28) 30%, transparent 55%)",
          pointerEvents: "none",
        }}/>

        {/* ELO rating chip — bottom-left */}
        <div
          style={{
            position: "absolute", bottom: 10, left: 10,
            display: "flex", alignItems: "center", gap: 5,
            zIndex: 10,
          }}
        >
          <div style={{
            width: 5, height: 5,
            background: "var(--gold)",
            transform: "rotate(45deg)",
          }}/>
          <span style={{
            fontSize: 11, fontWeight: 900,
            letterSpacing: "0.06em",
            color: "var(--gold)",
            fontVariantNumeric: "tabular-nums",
          }}>
            {Math.round(rating)}
          </span>
        </div>

        {/* Hover CTA overlay */}
        {!disabled && !anySelected && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            style={{ pointerEvents: "none" }}
          >
            <div style={{
              background: "var(--gold)",
              color: "var(--surface-0)",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "8px 20px",
              transform: "rotate(-1.5deg)",
            }}>
              Pick This
            </div>
          </motion.div>
        )}

        {/* Winner stamp */}
        <AnimatePresence>
          {isWinner && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at center, rgba(232,184,75,0.15) 0%, transparent 68%)",
              }}/>
              <motion.div
                initial={{ scale: 2, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: -2, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.03 }}
                style={{
                  background: "var(--gold)",
                  padding: "7px 20px",
                  boxShadow: "0 0 40px var(--gold-glow)",
                }}
              >
                <span style={{
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "var(--surface-0)",
                }}>
                  ✓ Chosen
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Caption ── */}
      <div style={{ marginTop: 10, textAlign: position === "right" ? "right" : "left" }}>
        <h3 style={{
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.35,
          letterSpacing: "-0.01em",
          color: isWinner ? "var(--gold)" : "var(--text-primary)",
          transition: "color 0.25s",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
          marginTop: 4,
        }}>
          {year}
        </p>
      </div>
    </motion.button>
  );
}
