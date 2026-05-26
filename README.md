# Docker 离线安装助手

一个帮助运维人员在无网络或内网服务器上离线安装 Docker 的辅助工具网站。

选择 Docker 版本和服务器架构后，自动生成对应的安装脚本，并提供 Docker 二进制包和 Docker Compose 的多镜像源下载链接。

## 功能

- **版本选择** — 支持主流 Docker 版本（24.0.9 ~ 29.0.0），每个版本配套对应的 Docker Compose 版本
- **架构支持** — x86_64 (AMD64) 和 aarch64 (ARM64)
- **安装脚本生成** — 根据选择的版本和架构动态生成完整的离线安装脚本，支持预览和下载
- **多镜像源下载** — Docker 二进制包提供官方源、清华大学、阿里云三个下载地址；Docker Compose 提供官方 GitHub 和国内加速镜像
- **暗色/浅色主题** — 跟随偏好切换，本地持久化

## 安装脚本功能

生成的安装脚本包含以下步骤：

1. Root 权限检查
2. Docker 二进制包解压安装到 `/usr/bin`
3. Docker Compose 安装到 `/usr/local/bin`（可选）
4. 清理已存在的 runc
5. 创建 docker 用户组
6. 生成 `/etc/docker/daemon.json` 配置（数据目录、日志限制、存储驱动）
7. 配置 systemd 服务并启动
8. 安装结果验证

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Radix UI
- **样式**: Tailwind CSS v4
- **语言**: TypeScript
- **图标**: lucide-react

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

## 部署

项目已配置为可直接部署到 Vercel，导入 GitHub 仓库后自动识别为 Next.js 项目。

## 使用方式

1. 打开网站，选择需要安装的 Docker 版本
2. 选择目标服务器的 CPU 架构（不确定可在服务器上执行 `uname -m` 查看）
3. 下载安装脚本和对应的 Docker 二进制包、Docker Compose 二进制文件
4. 将所有文件上传到目标服务器同一目录下
5. 以 root 权限执行安装脚本：

```bash
sudo bash docker-install.sh
```

## 许可证

MIT
