"use client";

import { useEffect, useState } from "react";
import { X, Copy, Download, Check } from "lucide-react";
import { generateInstallScript } from "@/lib/docker-utils";

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  dockerVersion: string;
  arch: "x86_64" | "aarch64";
}

export function ScriptModal({ isOpen, onClose, dockerVersion, arch }: ScriptModalProps) {
  const [copied, setCopied] = useState(false);
  const script = generateInstallScript(dockerVersion, arch);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([script], { type: "text/x-shellscript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `install-docker-${dockerVersion}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">安装脚本预览</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          <pre className="p-4 rounded-lg bg-[var(--code-bg)] border border-border font-mono text-sm leading-7 text-foreground overflow-x-auto whitespace-pre">
            {script}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
          <button
            onClick={handleCopy}
            className="h-10 px-4 rounded-lg border border-border bg-secondary text-secondary-foreground font-medium text-sm flex items-center gap-2 hover:border-accent/50 hover:text-accent transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制脚本
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <Download className="w-4 h-4" />
            下载脚本
          </button>
        </div>
      </div>
    </div>
  );
}
