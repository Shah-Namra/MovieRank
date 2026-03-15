"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-14 h-7 rounded-full transition-colors duration-400 focus:outline-none"
      style={{
        background: isDark ? "rgba(245,200,66,0.12)" : "rgba(200,146,10,0.15)",
        border: "1px solid var(--amber)",
      }}
      aria-label="Toggle theme"
      title={isDark ? "Switch to Day mode" : "Switch to Night mode"}
    >
      {/* Track icons */}
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] select-none">
        {/* Moon */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            color: isDark ? "var(--amber)" : "var(--text-dim)",
            transition: "color 0.3s",
          }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        </svg>
      </span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] select-none">
        {/* Sun */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            color: !isDark ? "var(--amber)" : "var(--text-dim)",
            transition: "color 0.3s",
          }}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </span>
      {/* Knob */}
      <motion.div
        animate={{ x: isDark ? 2 : 28 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute top-1 w-5 h-5 rounded-full"
        style={{ background: "var(--amber)" }}
      />
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className={cn(
          "transition-all duration-300",
          scrolled
            ? "bg-[var(--background)]/88 backdrop-blur-xl border-b"
            : "bg-transparent border-b border-transparent",
        )}
        style={{ borderColor: scrolled ? "var(--border)" : "transparent" }}
      >
        <div className="px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3 shrink-0">
              <div className="relative">
                <div
                  className="w-7 h-7 rounded-sm transition-transform duration-300 group-hover:rotate-[50deg]"
                  style={{
                    background: "var(--amber)",
                    transform: "rotate(45deg)",
                  }}
                />
              </div>
              <div
                className="font-black text-[15px] tracking-[0.15em] uppercase"
                style={{ color: "var(--foreground)" }}
              >
                Cinema<span style={{ color: "var(--amber)" }}>Rank</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-6">
              {[
                { path: "/", label: "Battle" },
                { path: "/leaderboard", label: "Ranks" },
              ].map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="relative px-1 py-2 text-[12px] font-black tracking-[0.14em] uppercase transition-colors duration-200"
                    style={{
                      color: isActive
                        ? "var(--amber)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-bar"
                        className="absolute bottom-0 left-0 right-0 h-[2px]"
                        style={{ background: "var(--amber)" }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      />
                    )}
                  </Link>
                );
              })}

              <ThemeToggle />
            </nav>

            {/* Mobile: theme + hamburger */}
            <div className="sm:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex flex-col gap-1.5 p-2"
                aria-label="Toggle menu"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={
                      mobileOpen
                        ? i === 0
                          ? { rotate: 45, y: 7 }
                          : i === 1
                            ? { opacity: 0 }
                            : { rotate: -45, y: -7 }
                        : { rotate: 0, y: 0, opacity: 1 }
                    }
                    className="block w-5 h-0.5 origin-center"
                    style={{ background: "var(--foreground)" }}
                  />
                ))}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-b overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="px-6 py-4 space-y-1">
              {[
                { path: "/", label: "Battle" },
                { path: "/leaderboard", label: "Rankings" },
              ].map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-[12px] font-black tracking-[0.1em] uppercase border-l-2 transition-colors"
                  style={{
                    color:
                      pathname === item.path
                        ? "var(--amber)"
                        : "var(--text-secondary)",
                    borderColor:
                      pathname === item.path ? "var(--amber)" : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
