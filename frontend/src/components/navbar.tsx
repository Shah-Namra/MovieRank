"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import {
  FilmIcon,
  BoltIcon,
  TrophyIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { path: "/", label: "Battle", icon: BoltIcon },
  { path: "/leaderboard", label: "Leaderboard", icon: TrophyIcon },
];

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
      <motion.div
        initial={false}
        animate={{
          backgroundColor: scrolled
            ? "rgba(255, 255, 255, 0.9)"
            : "rgba(255, 255, 255, 0.7)",
          backdropFilter: scrolled ? "blur(20px)" : "blur(12px)",
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "border-b transition-colors duration-200",
          scrolled ? "border-border shadow-soft" : "border-transparent",
        )}
      >
        <Container>
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group focus-ring rounded-lg -ml-2 pl-2 pr-3 py-1.5"
            >
              <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <FilmIcon
                  className="h-5 w-5 text-background"
                  strokeWidth={1.5}
                />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-lg text-foreground leading-none tracking-tight">
                  CinemaRank
                </div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">
                  Battle
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;

                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus-ring",
                      isActive
                        ? "text-foreground bg-secondary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    <span>{item.label}</span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-2.25 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden p-2.5 rounded-lg hover:bg-secondary transition-colors focus-ring"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CloseIcon className="h-5 w-5 text-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <MenuIcon className="h-5 w-5 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </Container>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="sm:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <Container>
              <nav className="py-4 space-y-1">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-colors",
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                        )}
                      >
                        <Icon className="h-5 w-5" strokeWidth={2} />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
