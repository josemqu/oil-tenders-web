"use client";

import { useEffect, useState } from "react";

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialize from localStorage or system preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      const systemDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = stored || (systemDark ? "dark" : "light");
      setTheme(initial);
      applyTheme(initial);
      setMounted(true);
    } catch {
      setMounted(true);
    }
  }, []);

  // If user changes OS theme and there's no explicit preference, we could sync.
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("theme");
      if (!stored) {
        const next = e.matches ? "dark" : "light";
        setTheme(next);
        applyTheme(next);
      }
    };
    try {
      mql.addEventListener("change", handler);
    } catch {
      // Safari fallback
      mql.addListener(handler);
    }
    return () => {
      try {
        mql.removeEventListener("change", handler);
      } catch {
        mql.removeListener(handler);
      }
    };
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        aria-label="Cambiar tema"
        className="h-9 w-9 rounded-md border border-border bg-background text-foreground opacity-0"
      />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
      }
      className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
    >
      {theme === "dark" ? (
        <span role="img" aria-hidden>
          🌙
        </span>
      ) : (
        <span role="img" aria-hidden>
          ☀️
        </span>
      )}
    </button>
  );
}
