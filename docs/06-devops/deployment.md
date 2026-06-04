# 生产环境部署

## 部署架构

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  (SSL/TLS)  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Frontend │ │  Admin   │ │ Backend  │
        │ (PM2)    │ │ (PM2)    │ │ (PM2)    │
        └──────────┘ └──────────┘ └──────────┘
                                      │
                           ┌──────────┼──────────┐
                           │                     │
                           ▼                     ▼
                     ┌──────────┐         ┌──────────┐
                     │PostgreSQL│         │  Redis   │
                     │ (主库)   │         │ (缓存)   │
                     └──────────┘         └──────────┘
```

## 服务器要求

| 资源 | 最低 | 推荐 |
|------|------|------|
| CPU | 2 核 | 4 核 |
| 内存 | 4 GB | 8 GB |
| 磁盘 | 50 GB SSD | 100 GB SSD |
| 带宽 | 5 Mbps | 10 Mbps |

## Nginx 配置

```nginx
# /etc/nginx/sites-available/toaiapi
server {
    listen 80;
    server_name api.toaiapi.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.toaiapi.com;

    ssl_certificate /etc/letsencrypt/live/api.toaiapi.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.toaiapi.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /v1/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE 支持
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
    }

    # Backend API (其他)
    location ~ ^/(auth|users|api-keys|balance|admin)/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name admin.toaiapi.com;

    ssl_certificate /etc/letsencrypt/live/admin.toaiapi.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.toaiapi.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## PM2 配置

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'toaiapi-backend',
      script: 'dist/main.js',
      cwd: './apps/backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      max_memory_restart: '1G',
      error_file: '/var/log/toaiapi/backend-error.log',
      out_file: '/var/log/toaiapi/backend-out.log',
    },
    {
      name: 'toaiapi-frontend',
      script: 'server.js',
      cwd: './apps/frontend/.next/standalone',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'toaiapi-admin',
      script: 'server.js',
      cwd: './apps/admin/.next/standalone',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
};
```

## 数据库迁移

```bash
# 部署前执行迁移
cd /opt/toaiapi
pnpm db:migrate

# 如需 seed
pnpm db:seed
```

## SSL 证书

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.toaiapi.com -d admin.toaiapi.com

# 自动续期
sudo certbot renew --dry-run
```

## 监控

```bash
# PM2 监控
pm2 monit

# 日志查看
pm2 logs toaiapi-backend

# 进程管理
pm2 status
pm2 restart all
```

## 备份策略

| 数据 | 频率 | 保留 |
|------|------|------|
| PostgreSQL | 每日 | 30 天 |
| Redis | 每日 | 7 天 |
| 应用日志 | 每日轮转 | 14 天 |

```bash
# cron 定时备份
0 2 * * * pg_dump -U toaiapi toaiapi | gzip > /backup/db_$(date +\%Y\%m\%d).sql.gz
0 3 * * * redis-cli BGSAVE && cp /var/lib/redis/dump.rdb /backup/redis_$(date +\%Y\%m\%d).rdb
```
