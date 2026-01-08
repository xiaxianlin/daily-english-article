# Deployment Guide - Daily English Article Backend

This guide provides step-by-step instructions for deploying the Daily English Article backend application using Docker and Docker Compose.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Local Deployment with Docker Compose](#local-deployment-with-docker-compose)
4. [Production Deployment](#production-deployment)
5. [Health Checks and Monitoring](#health-checks-and-monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## Prerequisites

Before deploying, ensure you have the following installed:

- **Docker**: >= 20.10
- **Docker Compose**: >= 2.0
- **Git**: For cloning the repository

Verify installations:
```bash
docker --version
docker compose version
git --version
```

---

## Environment Configuration

### 1. Clone the Repository

```bash
git clone git@github.com:xiaxianlin/daily-english-article.git
cd daily-english-article/backend
```

### 2. Configure Environment Variables

Copy the production environment template and update it with your values:

```bash
cp .env.prod .env
```

Edit `.env` and update the following critical values:

```bash
# MongoDB Configuration
MONGODB_USERNAME=your_secure_username
MONGODB_PASSWORD=your_secure_password_here  # CHANGE THIS!

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production  # CHANGE THIS!

# LLM Provider Configuration
LLM_PROVIDER=zhipu  # Options: zhipu, qwen, openai
LLM_ZHIPU_API_KEY=your_zhipu_api_key  # CHANGE THIS!
```

### 3. Generate Secure Secrets

Generate secure random strings for passwords and secrets:

```bash
# Generate JWT secret (256 bits)
openssl rand -base64 32

# Generate MongoDB password
openssl rand -base64 16
```

---

## Local Deployment with Docker Compose

### Quick Start

Start all services (MongoDB + Application):

```bash
docker compose up -d
```

### Verify Deployment

1. **Check container status**:
```bash
docker compose ps
```

Expected output:
```
NAME                          STATUS    PORTS
daily-english-backend         running   0.0.0.0:3000->3000/tcp
daily-english-mongodb         running   0.0.0.0:27017->27017/tcp
```

2. **Health check**:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-08T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

3. **View logs**:
```bash
# Application logs
docker compose logs -f app

# MongoDB logs
docker compose logs -f mongodb
```

4. **Access API documentation**:
Open browser: http://localhost:3000/api/docs

### Stop Services

```bash
docker compose down
```

To remove volumes as well (WARNING: deletes database data):
```bash
docker compose down -v
```

---

## Production Deployment

### Option 1: Docker Compose with Nginx

For production use, enable the Nginx reverse proxy:

```bash
docker compose --profile with-nginx up -d
```

This will:
- Start Nginx on port 80
- Configure rate limiting (10 req/s with burst of 20)
- Add security headers
- Proxy requests to the backend application

Access the application:
```bash
curl http://localhost/health
```

### Option 2: Direct Deployment to VPS/Cloud

#### 1. Prepare the Server

Connect to your server (Ubuntu/Debian example):

```bash
ssh user@your-server-ip
```

Update system:
```bash
sudo apt update && sudo apt upgrade -y
```

Install Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Install Docker Compose:
```bash
sudo apt install docker-compose-plugin -y
```

#### 2. Deploy Application

```bash
# Clone repository
git clone git@github.com:xiaxianlin/daily-english-article.git
cd daily-english-article/backend

# Configure environment
cp .env.prod .env
nano .env  # Edit with your production values

# Start services
docker compose up -d
```

#### 3. Configure Firewall

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

#### 4. Set Up SSL with Let's Encrypt (Recommended)

Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

Obtain certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

Certbot will automatically configure Nginx with SSL.

Update `nginx.conf` for SSL:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # ... rest of configuration
}
```

---

## Health Checks and Monitoring

### Application Health

Check application health:
```bash
curl http://localhost:3000/health
```

### Container Health

View container health status:
```bash
docker compose ps
```

Expected output should show "healthy" status:
```
NAME                          STATUS
daily-english-backend         Up (healthy)
daily-english-mongodb         Up (healthy)
```

### Log Monitoring

View application logs:
```bash
# Follow logs in real-time
docker compose logs -f app

# View last 100 lines
docker compose logs --tail=100 app

# View only error logs
docker compose logs app | grep ERROR
```

Log files are also persisted in the `logs/` directory:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

---

## Troubleshooting

### Issue: Container fails to start

**Symptoms**: `docker compose ps` shows "Exit" or "Restarting"

**Solution**:
```bash
# View container logs
docker compose logs app

# Common issues:
# 1. Port already in use - Change PORT in .env
# 2. MongoDB connection failed - Check MONGODB_URI
# 3. Missing environment variables - Verify .env file
```

### Issue: Database connection errors

**Symptoms**: Application logs show "MongoServerError" or "ECONNREFUSED"

**Solution**:
```bash
# Check MongoDB container is running
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Verify connection string in .env
# MONGODB_URI=mongodb://admin:password@mongodb:27017/...
```

### Issue: LLM API errors

**Symptoms**: AI feedback generation fails with API errors

**Solution**:
```bash
# Verify API keys are set correctly
docker compose exec app env | grep LLM

# Test API connectivity
curl -X POST https://open.bigmodel.cn/api/paas/v4/chat/completions \
  -H "Authorization: Bearer $LLM_ZHIPU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4","messages":[{"role":"user","content":"test"}]}'

# Fallback to different provider in .env
LLM_PROVIDER=openai  # or qwen
```

### Issue: Out of memory

**Symptoms**: Container exits with code 137

**Solution**:
```bash
# Check available memory
free -h

# Limit Docker memory usage in docker-compose.yml:
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
```

### Issue: High disk usage

**Symptoms**: Docker volumes consuming too much space

**Solution**:
```bash
# Check disk usage
docker system df

# Clean up unused images
docker system prune -a

# Rotate logs (add to docker-compose.yml):
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## Maintenance

### Database Backups

Create automated backups:

```bash
# Backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker compose exec -T mongodb mongodump \
  --username=admin \
  --password=$MONGODB_PASSWORD \
  --authenticationDatabase=admin \
  --archive=$BACKUP_DIR/backup_$DATE.gz \
  --gzip

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.gz" -mtime +7 -delete
EOF

chmod +x backup.sh
```

Add to crontab for daily backups:
```bash
crontab -e

# Add line for daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### Restore from Backup

```bash
docker compose exec -T mongodb mongorestore \
  --username=admin \
  --password=$MONGODB_PASSWORD \
  --authenticationDatabase=admin \
  --archive=/path/to/backup.gz \
  --gzip
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Monitor health
docker compose logs -f app
```

### View Application Metrics

The application provides basic metrics via the health endpoint:

```bash
curl http://localhost:3000/health
```

For advanced monitoring, consider:
- Prometheus + Grafana
- DataDog
- New Relic

---

## Security Best Practices

1. **Change default passwords**: Always update `MONGODB_PASSWORD` and `JWT_SECRET`
2. **Use HTTPS**: Enable SSL with Let's Encrypt in production
3. **Rate limiting**: Nginx configuration includes rate limiting
4. **Environment variables**: Never commit `.env` files to git
5. **Regular updates**: Keep Docker images updated
6. **Firewall**: Use `ufw` or `iptables` to restrict access
7. **Database access**: MongoDB is not exposed to public internet by default

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/xiaxianlin/daily-english-article/issues
- API Documentation: http://your-domain.com/api/docs
- Health Check: http://your-domain.com/health

---

## Appendix

### Docker Compose Commands Reference

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Execute command in container
docker compose exec app sh

# View resource usage
docker compose top
```

### Environment Variables Reference

See `.env.prod` for complete list of configurable variables.
