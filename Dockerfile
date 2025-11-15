# 使用官方 Node.js 镜像作为基础镜像
FROM node:20-alpine AS base

# 安装 pnpm（使用 npm 全局安装，更可靠）
RUN npm install -g pnpm@latest

# 设置工作目录
WORKDIR /app

# ====================
# 依赖安装阶段
# ====================
FROM base AS deps

# 复制包管理文件
COPY package.json pnpm-workspace.yaml* ./

# 安装依赖（包括 devDependencies，构建时需要）
RUN pnpm install

# ====================
# 构建阶段
# ====================
FROM base AS builder

# 接受代理构建参数
ARG HTTPS_PROXY
ARG HTTP_PROXY

# 从依赖阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules

# 复制源代码
COPY . .

# 设置构建时的环境变量（包括代理）
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# 设置代理环境变量（如果提供了构建参数）
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV HTTP_PROXY=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}
ENV http_proxy=${HTTP_PROXY}

# 构建 Next.js 应用
RUN pnpm build

# ====================
# 运行阶段
# ====================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 复制必要的文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 暴露端口
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]
