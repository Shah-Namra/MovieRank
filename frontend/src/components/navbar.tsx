"use client";
import { Film, Trophy, Zap, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Container } from "./ui/container";
const navItems = [
  { path: "/", label: "Compare", icon: Zap },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function Navbar() {
  const [pathname, setPathname] = useState("/");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Backdrop blur container */}
        <div
          className={`transition-all duration-300 ${
            scrolled
              ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
              : "bg-black/60 backdrop-blur-lg"
          }`}
        >
          <Container>
            <div className="flex h-16 items-center justify-between">
              {/* Logo - MORE CHARACTER */}
              <button
                onClick={() => setPathname("/")}
                className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-1 -ml-1"
              >
                <motion.div
                  className="relative"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Film className="h-6 w-6 text-white" strokeWidth={2} />

                  {/* Sparkle on hover */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-white"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>

                <div className="flex flex-col items-start">
                  <span className="font-bold text-base tracking-tight text-white leading-none">
                    CinemaRank
                  </span>
                  <span className="text-[10px] text-white/40 font-medium tracking-wide uppercase leading-none mt-0.5">
                    Battle
                  </span>
                </div>
              </button>

              {/* Desktop Nav */}
              <nav className="hidden sm:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => setPathname(item.path)}
                      className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 text-white/60 hover:text-white"
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.5} />
                      <span>{item.label}</span>

                      {/* Active indicator - BETTER ANIMATION */}
                      {isActive && (
                        <>
                          <motion.div
                            layoutId="navbar-bg"
                            className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        </>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="sm:hidden p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </Container>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="sm:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl overflow-hidden"
            >
              <Container>
                <nav className="py-4 space-y-1">
                  {navItems.map((item, i) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.path}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => {
                          setPathname(item.path);
                          setMobileOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={2.5} />
                        <span>{item.label}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Demo content */}
    </>
  );
}
