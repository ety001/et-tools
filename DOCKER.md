# Docker 部署指南

本项目提供了完整的 Docker 支持，可以轻松构建和运行 Docker 镜像。

## 前置要求

- Docker 已安装
- 可选：Docker Compose（用于更简单的部署）

## 构建 Docker 镜像

### 方式1: 使用 Docker 命令

```bash
# 构建镜像
docker build -t et-tools:latest .

# 运行容器
docker run -d -p 3000:3000 --name et-tools et-tools:latest
```

### 方式2: 使用 Docker Compose（推荐）

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

## 访问应用

构建完成后，应用将在以下地址可用：
- http://localhost:3000

## 环境变量

如果需要配置环境变量，可以在 `docker-compose.yml` 中添加：

```yaml
services:
  et-tools:
    environment:
      - NODE_ENV=production
      - CUSTOM_VAR=value
```

或者使用 `.env` 文件：

```bash
docker-compose --env-file .env.production up
```

## 镜像特点

- ✅ 多阶段构建，减小镜像体积
- ✅ 使用 Alpine Linux 基础镜像，轻量级
- ✅ 非 root 用户运行，提高安全性
- ✅ Next.js standalone 模式，优化运行时性能
- ✅ 包含所有必要的依赖和静态资源

## 生产环境建议

1. **使用具体的镜像标签而非 `latest`**
   ```bash
   docker build -t et-tools:v1.0.0 .
   ```

2. **配置资源限制**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
   ```

3. **使用反向代理（如 Nginx）**
   - 处理 SSL/TLS
   - 负载均衡
   - 静态资源缓存

4. **持久化数据**（如果需要）
   ```yaml
   volumes:
     - ./data:/app/data
   ```

## 故障排查

### 查看容器日志
```bash
docker logs et-tools
# 或使用 docker-compose
docker-compose logs -f
```

### 进入容器调试
```bash
docker exec -it et-tools sh
```

### 检查端口占用
```bash
# 检查端口 3000 是否被占用
lsof -i :3000
# 或
netstat -tulpn | grep 3000
```

## 清理

```bash
# 停止并删除容器
docker-compose down

# 删除镜像
docker rmi et-tools:latest

# 清理未使用的镜像和缓存
docker system prune -a
```

