"use client";

import { Eye, Download, ExternalLink } from "lucide-react";
import { generateInstallScript, getDockerDownloadUrls, getComposeDownloadUrls, getComposeVersion, ARCH_MAP } from "@/lib/docker-utils";

interface ResourcesSectionProps {
  dockerVersion: string;
  arch: "x86_64" | "aarch64";
  onPreviewScript: () => void;
}

export function ResourcesSection({
  dockerVersion,
  arch,
  onPreviewScript,
}: ResourcesSectionProps) {
  const archInfo = ARCH_MAP[arch];
  const dockerUrls = getDockerDownloadUrls(dockerVersion, arch);
  const composeVersion = getComposeVersion(dockerVersion);
  const composeUrls = getComposeDownloadUrls(composeVersion, arch);

  const handleDownloadScript = () => {
    const script = generateInstallScript(dockerVersion, arch);
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

  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Script Card */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-foreground mb-1">安装脚本</h3>
            <p className="text-accent font-mono text-sm">
              Docker v{dockerVersion} + Compose v{composeVersion}
            </p>
            <p className="text-xs text-muted-foreground mt-2">架构: {archInfo.label}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={onPreviewScript}
              className="w-full h-10 px-4 rounded-lg border border-border bg-secondary text-secondary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:border-accent/50 hover:text-accent transition-all"
            >
              <Eye className="w-4 h-4" />
              预览脚本
            </button>
            <button
              onClick={handleDownloadScript}
              className="w-full h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <Download className="w-4 h-4" />
              下载脚本
            </button>
          </div>
        </div>

        {/* Docker Engine Card */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Docker Engine</h3>
            <p className="text-accent font-mono text-sm">v{dockerVersion}</p>
            <p className="text-xs text-muted-foreground mt-2">架构: {archInfo.label}</p>
          </div>
          <div className="space-y-2">
            {dockerUrls.map((item) => (
              <a
                key={item.source}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary text-sm transition-all group"
              >
                <span className="font-medium text-foreground">{item.source}</span>
                <span className="text-accent text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  下载 <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Docker Compose Card */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Docker Compose</h3>
            <p className="text-accent font-mono text-sm">v{composeVersion}</p>
            <p className="text-xs text-muted-foreground mt-2">架构: {archInfo.label}</p>
          </div>
          <div className="space-y-2">
            {composeUrls.map((item) => (
              <a
                key={item.source}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary text-sm transition-all group"
              >
                <span className="font-medium text-foreground">{item.source}</span>
                <span className="text-accent text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  下载 <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
