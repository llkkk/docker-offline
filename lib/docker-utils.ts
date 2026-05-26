export const DOCKER_VERSIONS = [
  { version: "29.0.0", composeVersion: "2.35.0" },
  { version: "28.3.2", composeVersion: "2.36.1" },
  { version: "27.5.1", composeVersion: "2.32.4" },
  { version: "26.1.5", composeVersion: "2.27.0" },
  { version: "25.0.5", composeVersion: "2.24.5" },
  { version: "24.0.9", composeVersion: "2.20.2" },
];

export function getComposeVersion(dockerVersion: string): string {
  const found = DOCKER_VERSIONS.find(v => v.version === dockerVersion);
  return found ? found.composeVersion : DOCKER_VERSIONS[0].composeVersion;
}

export const ARCH_MAP = {
  x86_64: { docker: "x86_64", compose: "x86_64", label: "x86_64" },
  aarch64: { docker: "aarch64", compose: "aarch64", label: "aarch64" },
};

export function getDockerDownloadUrls(version: string, archKey: "x86_64" | "aarch64") {
  const arch = ARCH_MAP[archKey];
  const fileName = `docker-${version}.tgz`;
  const officialBase = `https://download.docker.com/linux/static/stable/${arch.docker}`;
  const tsinghuaBase = `https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/static/stable/${arch.docker}`;
  const aliyunBase = `https://mirrors.aliyun.com/docker-ce/linux/static/stable/${arch.docker}`;
  return [
    { source: "官方源", url: `${officialBase}/${fileName}` },
    { source: "清华大学", url: `${tsinghuaBase}/${fileName}` },
    { source: "阿里云", url: `${aliyunBase}/${fileName}` },
  ];
}

export function getComposeDownloadUrls(version: string, archKey: "x86_64" | "aarch64") {
  const arch = ARCH_MAP[archKey];
  const fileName = `docker-compose-linux-${arch.compose}`;
  return [
    { source: "官方源 (GitHub)", url: `https://github.com/docker/compose/releases/download/v${version}/${fileName}` },
    { source: "GHProxy 镜像", url: `https://ghfast.top/https://github.com/docker/compose/releases/download/v${version}/${fileName}` },
    { source: "GitHub 加速镜像", url: `https://ghp.ci/https://github.com/docker/compose/releases/download/v${version}/${fileName}` },
  ];
}

export function generateInstallScript(dockerVersion: string, arch: "x86_64" | "aarch64") {
  const composeVersion = getComposeVersion(dockerVersion);
  const archInfo = ARCH_MAP[arch];
  const dockerFileName = `docker-${dockerVersion}.tgz`;
  const composeFileName = `docker-compose-linux-${archInfo.compose}`;

  return `#!/bin/bash
# ============================================
# Docker 离线安装/卸载脚本
# Docker 版本:  ${dockerVersion}
# Compose 版本: v${composeVersion}
# 目标架构:     ${archInfo.label}
# 生成时间:     $(date '+%Y-%m-%d %H:%M:%S')
# ============================================
#
# 用法:
#   安装: sudo bash docker-install.sh
#   卸载: sudo bash docker-install.sh uninstall
#   卸载并删除数据: sudo bash docker-install.sh uninstall --remove-data
# ============================================

set -euo pipefail

DOCKER_PACKAGE="${dockerFileName}"
COMPOSE_FILE="${composeFileName}"
DEPLOY_PATH="/usr/bin"
DOCKER_DATA_PATH="/var/lib/docker"

DOCKER_BINARIES=(
    containerd containerd-shim containerd-shim-runc-v2
    ctr docker dockerd docker-init docker-proxy
    runc
)

echo_info() {
    echo -e "\\033[32m[INFO]\\033[0m $1"
}

echo_warn() {
    echo -e "\\033[33m[WARN]\\033[0m $1"
}

echo_error() {
    echo -e "\\033[31m[ERROR]\\033[0m $1" >&2
}

# ============================================
# 安装
# ============================================

install_docker() {
    echo_info "开始 Docker 离线安装..."

    read -p "请输入 Docker 数据存储路径 [默认: /var/lib/docker]: " input_data_path
    if [ -n "$input_data_path" ]; then
        DOCKER_DATA_PATH="$input_data_path"
    fi
    echo_info "Docker 数据路径: $DOCKER_DATA_PATH"

    if [ ! -f "$DOCKER_PACKAGE" ]; then
        echo_error "未找到 Docker 包: $DOCKER_PACKAGE"
        echo_info "请将 Docker 二进制包放在脚本同目录下"
        exit 1
    fi
    echo_info "找到 Docker 包: $DOCKER_PACKAGE"

    if command -v docker >/dev/null 2>&1; then
        echo_info "检测到已安装 Docker: $(docker --version)"
        echo_info "将继续安装，覆盖现有版本..."
    fi

    for runc_path in /usr/bin/runc /usr/local/bin/runc /sbin/runc /usr/sbin/runc /bin/runc; do
        if [ -e "$runc_path" ]; then
            echo_info "清理已存在的 runc: $runc_path"
            rm -f "$runc_path"
        fi
    done

    echo_info "解压 Docker 二进制包..."
    TEMP_DIR="/tmp/docker-extract-$$"
    mkdir -p "$TEMP_DIR"
    tar -xzf "$DOCKER_PACKAGE" -C "$TEMP_DIR"

    if [ -d "$TEMP_DIR/docker" ]; then
        cp -f "$TEMP_DIR"/docker/* "$DEPLOY_PATH/"
    else
        cp -f "$TEMP_DIR"/* "$DEPLOY_PATH/"
    fi
    rm -rf "$TEMP_DIR"
    echo_info "Docker 二进制文件已安装到 $DEPLOY_PATH"

    if [ -f "$COMPOSE_FILE" ]; then
        echo_info "安装 Docker Compose..."
        cp -f "$COMPOSE_FILE" /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        if docker compose version >/dev/null 2>&1; then
            echo_info "Docker Compose 安装成功"
            docker compose version
        elif /usr/local/bin/docker-compose version >/dev/null 2>&1; then
            echo_info "Docker Compose 安装成功"
            /usr/local/bin/docker-compose version
        else
            echo_warn "Docker Compose 安装后验证失败"
        fi
    else
        echo_info "未找到 $COMPOSE_FILE，跳过 Compose 安装"
    fi

    if ! getent group docker >/dev/null 2>&1; then
        groupadd docker
        echo_info "已创建 docker 用户组"
    fi

    mkdir -p /etc/docker
    chmod 755 /etc/docker
    mkdir -p "$DOCKER_DATA_PATH"
    chmod 755 "$DOCKER_DATA_PATH"

    if [ "$DOCKER_DATA_PATH" = "/var/lib/docker" ]; then
        cat > /etc/docker/daemon.json <<DEOF
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "100m",
        "max-file": "3"
    }
}
DEOF
    else
        cat > /etc/docker/daemon.json <<DEOF
{
    "data-root": "$DOCKER_DATA_PATH",
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "100m",
        "max-file": "3"
    }
}
DEOF
    fi
    echo_info "Docker 配置文件已生成"

    cat > /etc/systemd/system/docker.service <<'EOF'
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target firewalld.service
Wants=network-online.target

[Service]
Type=notify
ExecStart=/usr/bin/dockerd
ExecReload=/bin/kill -s HUP $MAINPID
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TimeoutStartSec=0
Delegate=yes
KillMode=process
Restart=on-failure
StartLimitBurst=3
StartLimitInterval=60s

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable docker.service
    systemctl start docker.service

    if systemctl is-active --quiet docker; then
        echo_info "Docker 服务已启动"
    else
        echo_error "Docker 服务启动失败"
        systemctl status docker.service
        exit 1
    fi

    echo_info "=========================================="
    echo_info "Docker 安装完成！"
    echo_info "=========================================="
    docker --version
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose --version
    fi
    echo_info "=========================================="
    echo_info "常用命令:"
    echo_info "  docker ps          # 查看运行中的容器"
    echo_info "  docker images      # 查看镜像列表"
    echo_info "  docker compose up  # 启动 compose 服务"
    echo_info "=========================================="
    echo_info "如需非 root 用户使用 Docker，请执行:"
    echo_info "  sudo usermod -aG docker <用户名>"
    echo_info "=========================================="
    echo_info "如需卸载，请执行:"
    echo_info "  sudo bash $0 uninstall"
    echo_info "=========================================="
}

# ============================================
# 卸载
# ============================================

uninstall_docker() {
    local remove_data=false
    if [ "$#" -gt 0 ] && [ "$1" = "--remove-data" ]; then
        remove_data=true
    fi

    echo_warn "即将卸载 Docker..."
    if [ "$remove_data" = true ]; then
        echo_warn "将同时删除 Docker 数据目录: $DOCKER_DATA_PATH"
    fi
    echo_info "3 秒后开始，按 Ctrl+C 取消..."
    sleep 3

    if systemctl is-active --quiet docker 2>/dev/null; then
        echo_info "停止 Docker 服务..."
        systemctl stop docker.service
        systemctl stop docker.socket 2>/dev/null || true
    fi

    if systemctl is-enabled --quiet docker.service 2>/dev/null; then
        echo_info "禁用 Docker 服务..."
        systemctl disable docker.service
    fi

    if [ -f /etc/systemd/system/docker.service ]; then
        echo_info "删除 systemd 服务文件..."
        rm -f /etc/systemd/system/docker.service
        systemctl daemon-reload
    fi

    echo_info "清理 Docker 二进制文件..."
    for bin in "\${DOCKER_BINARIES[@]}"; do
        if [ -f "$DEPLOY_PATH/$bin" ]; then
            rm -f "$DEPLOY_PATH/$bin"
            echo_info "  已删除: $DEPLOY_PATH/$bin"
        fi
    done

    if [ -f /usr/local/bin/docker-compose ]; then
        echo_info "删除 Docker Compose..."
        rm -f /usr/local/bin/docker-compose
    fi

    if [ -f /etc/docker/daemon.json ]; then
        echo_info "删除 daemon.json 配置文件..."
        rm -f /etc/docker/daemon.json
    fi

    if [ -d /etc/docker ] && [ -z "$(ls -A /etc/docker 2>/dev/null)" ]; then
        rmdir /etc/docker
        echo_info "已删除空目录 /etc/docker"
    fi

    if [ "$remove_data" = true ] && [ -d "$DOCKER_DATA_PATH" ]; then
        echo_info "删除 Docker 数据目录: $DOCKER_DATA_PATH ..."
        rm -rf "$DOCKER_DATA_PATH"
    fi

    if getent group docker >/dev/null 2>&1; then
        if [ -z "$(getent group docker | cut -d: -f4)" ]; then
            groupdel docker
            echo_info "已删除 docker 用户组"
        else
            echo_warn "docker 用户组中仍有成员，保留用户组"
        fi
    fi

    echo_info "=========================================="
    echo_info "Docker 已卸载完成"
    if [ "$remove_data" != true ] && [ -d "$DOCKER_DATA_PATH" ]; then
        echo_info "Docker 数据目录保留: $DOCKER_DATA_PATH"
        echo_info "如需彻底删除数据，请执行:"
        echo_info "  sudo rm -rf $DOCKER_DATA_PATH"
    fi
    echo_info "=========================================="
}

# ============================================
# 主入口
# ============================================

if [ "$(id -u)" -ne 0 ]; then
    echo_error "请使用 root 用户运行此脚本 (sudo bash $0)"
    exit 1
fi

if [ "$#" -gt 0 ] && [ "$1" = "uninstall" ]; then
    shift
    uninstall_docker "$@"
else
    install_docker
fi
`;
}
