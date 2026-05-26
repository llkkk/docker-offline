"use client";

import { HelpCircle } from "lucide-react";
import { DOCKER_VERSIONS } from "@/lib/docker-utils";

interface ConfigSectionProps {
  dockerVersion: string;
  arch: "x86_64" | "aarch64";
  onVersionChange: (version: string) => void;
  onArchChange: (arch: "x86_64" | "aarch64") => void;
}

export function ConfigSection({
  dockerVersion,
  arch,
  onVersionChange,
  onArchChange,
}: ConfigSectionProps) {
  return (
    <section className="mb-10">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          {/* Docker Version */}
          <div className="flex-1 space-y-3">
            <label
              htmlFor="dockerVersion"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Docker 版本
            </label>
            <div className="relative">
              <select
                id="dockerVersion"
                value={dockerVersion}
                onChange={(e) => onVersionChange(e.target.value)}
                className="w-full h-11 px-4 pr-10 rounded-lg border border-border bg-input text-foreground font-mono text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              >
                {DOCKER_VERSIONS.map((v) => (
                  <option key={v.version} value={v.version}>
                    {v.version}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* CPU Architecture */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                CPU 架构
              </label>
              <div className="relative group">
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                <div className="absolute left-0 top-full mt-2 w-64 p-3 rounded-lg bg-foreground text-background text-xs font-mono leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                  <div className="absolute -top-1.5 left-2 w-3 h-3 bg-foreground rotate-45" />
                  执行 <code className="text-accent-foreground bg-background/20 px-1 rounded">uname -m</code> 查看：
                  <br />
                  x86_64 → Intel / AMD 64位
                  <br />
                  aarch64 → ARM 64位
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onArchChange("x86_64")}
                className={`flex-1 h-11 px-4 rounded-lg border font-mono text-sm transition-all ${
                  arch === "x86_64"
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-input border-border text-foreground hover:border-accent/50"
                }`}
              >
                x86_64
              </button>
              <button
                onClick={() => onArchChange("aarch64")}
                className={`flex-1 h-11 px-4 rounded-lg border font-mono text-sm transition-all ${
                  arch === "aarch64"
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-input border-border text-foreground hover:border-accent/50"
                }`}
              >
                aarch64
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
