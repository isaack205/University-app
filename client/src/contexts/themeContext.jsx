import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDarkState] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  // single function to update DOM and localStorage
  const setIsDark = useCallback((val) => {
    setIsDarkState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      try {
        const root = window?.document?.documentElement;
        if (next) root.classList.add("dark");
        else root.classList.remove("dark");
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {}
      return next;
    });
  }, []);

  // ensure DOM matches initial state on mount
  useEffect(() => {
    try {
      const root = window.document.documentElement;
      if (isDark) root.classList.add("dark");
      else root.classList.remove("dark");
    } catch {}
  }, []); // run once

  return <ThemeContext.Provider value={{ isDark, setIsDark }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}