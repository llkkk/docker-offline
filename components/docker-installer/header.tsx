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
          <img src="/docker-logo.png" alt="Docker" className="w-8 h-8 rounded-lg" />
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
