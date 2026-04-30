"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ThemeCtx {
  theme: "dark" | "light";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      if (saved === "light") {
        document.documentElement.classList.add("theme-light");
      }
    }
  }, []);

  const toggle = () => {
    setTheme((t) => {
      const newTheme = t === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", newTheme);
        if (newTheme === "light") {
          document.documentElement.classList.add("theme-light");
        } else {
          document.documentElement.classList.remove("theme-light");
        }
      }
      return newTheme;
    });
  };

  if (!isMounted) {
    return <ThemeContext.Provider value={{ theme: "dark", toggle }}>{children}</ThemeContext.Provider>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
