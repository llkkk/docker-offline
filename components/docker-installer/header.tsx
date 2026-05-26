"use client";

import { Sun, Moon } from "lucide-react";

interface HeaderProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-accent">
              <rect x="3" y="7" width="4" height="4" rx="0.5" fill="currentColor" />
              <rect x="10" y="7" width="4" height="4" rx="0.5" fill="currentColor" />
              <rect x="17" y="7" width="4" height="4" rx="0.5" fill="currentColor" />
              <rect x="10" y="2" width="4" height="4" rx="0.5" fill="currentColor" />
              <path d="M2 14h20c0 4-3.5 7-10 7S2 18 2 14z" fill="currentColor" fillOpacity="0.3" />
            </svg>
          </div>
          <span className="font-semibold text-foreground tracking-tight">Docker 离线安装助手</span>
        </div>

        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:border-accent/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
          aria-label="切换主题"
        >
          {theme === "dark" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
          <span>{theme === "dark" ? "深色" : "浅色"}</span>
        </button>
      </div>
    </header>
  );
}
