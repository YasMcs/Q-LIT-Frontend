"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar error de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-8 h-8"></div>;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 focus:outline-none"
      title="Cambiar tema"
    >
      {theme === "dark" ? (
        <i className="fa-solid fa-sun text-lg"></i>
      ) : (
        <i className="fa-solid fa-moon text-lg"></i>
      )}
    </button>
  );
}
