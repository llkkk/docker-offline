"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/docker-installer/header";
import { ConfigSection } from "@/components/docker-installer/config-section";
import { ResourcesSection } from "@/components/docker-installer/resources-section";
import { ScriptModal } from "@/components/docker-installer/script-modal";
import { Footer } from "@/components/docker-installer/footer";

export default function DockerInstallerPage() {
  const [dockerVersion, setDockerVersion] = useState("28.3.2");
  const [arch, setArch] = useState<"x86_64" | "aarch64">("x86_64");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const saved = localStorage.getItem("docker-helper-theme") as "dark" | "light" | null;
    const initial = saved || "light";
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("docker-helper-theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Intro */}
          <section className="mb-10">
            <p className="text-muted-foreground leading-relaxed max-w-3xl text-[15px]">
              在无网络或内网服务器上安装 Docker，需要提前准备好安装脚本、Docker 二进制包和 Docker Compose 二进制文件。
              <span className="text-foreground font-medium">选择版本和架构</span>后，本站自动生成安装脚本并提供所有资源的下载链接，每个文件提供官方和国内镜像源。
            </p>
          </section>

          {/* Config */}
          <ConfigSection
            dockerVersion={dockerVersion}
            arch={arch}
            onVersionChange={setDockerVersion}
            onArchChange={setArch}
          />

          {/* Resources */}
          <ResourcesSection
            dockerVersion={dockerVersion}
            arch={arch}
            onPreviewScript={() => setIsModalOpen(true)}
          />
        </div>
      </main>

      <Footer />

      <ScriptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dockerVersion={dockerVersion}
        arch={arch}
      />
    </div>
  );
}
