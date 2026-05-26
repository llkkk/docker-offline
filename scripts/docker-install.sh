#!/bin/bash

# 配置变量
DOCKER_PACKAGE_PREFIX="docker-__DOCKER_VERSION__"
DOCKER_COMPOSE_VERSION="__DOCKER_COMPOSE_VERSION__"
DEPLOY_PATH="/usr/bin"
DOCKER_DATA_PATH="/egova/data/docker"
SERVICE_TEMPLATE_PATH="./docker.service"
DAEMON_TEMPLATE_PATH="./daemon.json"

# 获取系统架构
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)
        ARCH_NAME="x86_64"
        ;;
    aarch64|arm64)
        ARCH_NAME="aarch64"
        ;;
    *)
        echo "Error: Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

# 设置 Docker 包名
DOCKER_PACKAGE="${DOCKER_PACKAGE_PREFIX}.tgz"

# 颜色输出函数
echo_info() {
    echo -e "\033[32m[INFO]\033[0m $1"
}

echo_error() {
    echo -e "\033[31m[ERROR]\033[0m $1" >&2
}

# 检查 Docker 包是否存在
check_docker_package() {
    if [ ! -f "$DOCKER_PACKAGE" ]; then
        echo_error "Docker package not found: $DOCKER_PACKAGE"
        echo_info "请将 Docker 二进制包手动下载到当前目录"
        echo_info "下载地址:"
        echo_info "  x86_64: https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/static/stable/x86_64/${DOCKER_PACKAGE}"
        echo_info "  aarch64: https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/static/stable/aarch64/${DOCKER_PACKAGE}"
        exit 1
    fi
    echo_info "找到 Docker 包: $DOCKER_PACKAGE"
}

# 检查并移除已存在的 runc
remove_existing_runc() {
    local runc_paths=(
        "/usr/bin/runc"
        "/usr/local/bin/runc"
        "/sbin/runc"
        "/usr/sbin/runc"
        "/bin/runc"
    )

    for path in "${runc_paths[@]}"; do
        if [ -e "$path" ]; then
            echo_info "Removing existing runc at $path"
            rm -f "$path"
        fi
    done
}

# 解压并安装 Docker 二进制文件
install_docker_binary() {
    echo_info "Installing Docker for ${ARCH_NAME} architecture..."

    local temp_dir="/tmp/docker-extract-$$"
    mkdir -p "$temp_dir"

    # 解压 Docker 包
    tar -xzf "$DOCKER_PACKAGE" -C "$temp_dir"

    # 复制二进制文件到 /usr/bin
    if [ -d "$temp_dir/docker" ]; then
        cp -f "$temp_dir"/docker/* "$DEPLOY_PATH/"
    else
        cp -f "$temp_dir"/* "$DEPLOY_PATH/"
    fi

    # 清理临时目录
    rm -rf "$temp_dir"

    echo_info "Docker binaries installed to $DEPLOY_PATH"
}

# 创建 docker 用户组
create_docker_group() {
    if ! getent group docker >/dev/null 2>&1; then
        groupadd docker
        echo_info "Docker group created"
    else
        echo_info "Docker group already exists"
    fi
}

# 准备 Docker 目录
prepare_docker_directories() {
    mkdir -p /etc/docker
    chmod 755 /etc/docker

    mkdir -p "$DOCKER_DATA_PATH"
    chmod 755 "$DOCKER_DATA_PATH"
    echo_info "Docker directories prepared"
}

# 配置 systemd 服务文件
configure_systemd_service() {
    # 创建 docker.service 文件
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

    # 创建 daemon.json 配置文件
    cat > /etc/docker/daemon.json <<EOF
{
    "data-root": "$DOCKER_DATA_PATH",
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "100m",
        "max-file": "3"
    },
    "storage-driver": "overlay2"
}
EOF

    echo_info "Systemd service file created"
}

# 启动 Docker 服务
start_docker_service() {
    systemctl daemon-reload
    systemctl enable docker.service
    systemctl start docker.service

    if systemctl is-active --quiet docker; then
        echo_info "Docker service started successfully"
    else
        echo_error "Docker service failed to start"
        systemctl status docker.service
        exit 1
    fi
}

# 验证 Docker 安装
verify_docker() {
    if command -v docker >/dev/null 2>&1; then
        echo_info "Docker installed successfully"
        docker --version
    else
        echo_error "Docker installation failed"
        exit 1
    fi
}

# 安装 Docker Compose
install_docker_compose() {
    local compose_file="docker-compose-linux-${ARCH_NAME}"

    if [ ! -f "$compose_file" ]; then
        echo_info "Docker Compose binary not found: $compose_file"
        echo_info "请将 docker-compose 二进制文件下载到当前目录"
        echo_info "下载地址:"
        echo_info "  https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-linux-${ARCH_NAME}"
        return 0
    fi

    echo_info "找到 Docker Compose: $compose_file"
    cp -f "$compose_file" /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    if docker compose version >/dev/null 2>&1; then
        echo_info "Docker Compose installed successfully"
        docker compose version
    elif /usr/local/bin/docker-compose version >/dev/null 2>&1; then
        echo_info "Docker Compose installed successfully"
        /usr/local/bin/docker-compose version
    else
        echo_error "Docker Compose installation failed"
    fi
}

# 主函数
main() {
    echo_info "Starting Docker offline installation..."

    # 检查是否为 root 用户
    if [ "$EUID" -ne 0 ]; then
        echo_error "Please run as root (use sudo)"
        exit 1
    fi

    check_docker_package

    # 检查 Docker 是否已安装
    if command -v docker >/dev/null 2>&1; then
        echo_info "Docker already installed:"
        docker --version
        read -p "Do you want to reinstall? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi

    # 执行安装步骤
    remove_existing_runc
    install_docker_binary
    create_docker_group
    prepare_docker_directories
    configure_systemd_service
    start_docker_service
    install_docker_compose
    verify_docker

    echo_info "=========================================="
    echo_info "Docker 安装完成！"
    echo_info "版本信息:"
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
}

# 运行主函数
main "$@"
