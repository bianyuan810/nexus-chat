# Docker 网络诊断

## 问题
无法连接到外部 HTTPS 网站（Supabase、Google 等）

## 可能的原因
1. Docker 默认网络配置阻止了外部连接
2. DNS 解析问题
3. 防火墙规则

## 解决方案

### 1. 使用 host 网络模式
```bash
# 停止当前容器
docker-compose down

# 使用 host 网络模式启动
docker-compose up --network host
```

### 2. 配置 DNS
```bash
# 在 docker-compose.yml 中添加 DNS 配置
services:
  app:
    dns:
      - 8.8.8.8
      - 8.8.4.4
```

### 3. 检查防火墙
确保 Docker 可以访问外部网络：
```bash
# 测试网络连接
docker run --rm alpine ping -c 3 8.8.8.8
```

### 4. 使用桥接网络
```yaml
# docker-compose.yml
networks:
  default:
    driver: bridge
```

## 验证
```bash
# 进入容器测试
docker exec -it <container-name> sh

# 测试外部连接
curl -I https://www.google.com
curl -I https://supabase.co
```
