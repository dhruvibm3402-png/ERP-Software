# AURA ERP - Production, Scale & Deployment Architecture

This guide prepares the existing Next.js + Prisma + Postgres codebase for secure, highly available Production deployment on VPS (Ubuntu/Debian) or Cloud configurations (AWS/DigitalOcean/Hetzner).

## 🚀 Technical Configuration
Your ERP codebase now strictly possesses:
1. **Containerized Production System** (`Dockerfile`, `docker-compose.yml`) ensuring identical parity across local test vs production.
2. **Reverse Proxy Load Balancer** (`nginx.conf`) configuring HTTPS, HTTP/2, automatic GZIP caching, Rate-Limiting, trailing-slash fixes, and WebSocket headers.
3. **Hardened Health Checks** (`/api/health`) connecting Ping and Memory tests for AWS / Docker swarm restarts.
4. **Automated Offline & Cloud DB Backups** (`scripts/backup.sh`)
5. **Continuous Deployment Pipeline** (`.github/workflows/deploy.yml`) containing build tests, typescript validation, Prisma automated Migrations, and Zero-Downtime rolling container rebuilds.
6. **Strict Node Env Enforcer** (`utils/envValidation.ts`) checking `.env` permutations rigorously with Zod.

## 🛠 Deployment Prerequisites

1. Rent a VPS (Ubuntu 24.04 LTS recommended)
2. Open ports `80` (HTTP), `443` (HTTPS), `22` (SSH)

## 📦 Zero-Downtime Deployment Command Stack

Connect to your VPS root SSH:

```bash
# 1. System Upgrade & Core Libraries
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git awscli curl

# 2. Add System Cron for Nightly Backups
chmod +x scripts/backup.sh
echo "0 2 * * * /opt/aura_erp/scripts/backup.sh >> /var/log/db_backup.log 2>&1" | crontab -

# 3. Secure Setup
cd /opt
git clone <your-repository-url> aura_erp
cd aura_erp
cp .env.example .env.production
nano .env.production # Provide true secure values

# 4. Trigger Orchestration Build + DB Migrate Setup
docker-compose --env-file .env.production up -d --build

# 5. Connect Let's Encrypt / Certbot SSL
docker run -it --rm -v ./certbot/conf:/etc/letsencrypt -v ./certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot -d erp.yourdomain.com
```

## 🔐 Advanced Security Triggers
- **Prisma SQL Engine Protection**: Bound gracefully behind `.env.production` internal network walls inside the `docker-compose.yml`. Wait for DB Health checks before spinning NextJS process endpoints.
- **Nginx Security Headers**: Applied `nosniff`, `SAMEORIGIN`, and XSS protection modes transparently wrapping NextJS Server Actions in proxy configuration.
- **Background Worker**: `bullmq` processes safely integrate via Redis network bridging port 6379, hidden from exterior probing.

*The codebase is now fully primed for infinite Horizontal Docker Scaling simply by spinning up Nginx Node Balancers across multiple droplet targets over a networked Postgres cluster connection string!*
