# Production Deployment Guide

## Option 1 — VPS / Linux Server (Recommended)

### Server Requirements
- Ubuntu 20.04 or 22.04
- 2GB RAM minimum (4GB recommended)
- 20GB storage

### Install Dependencies

```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (process manager)
npm install -g pm2

# Nginx
sudo apt-get install -y nginx
```

### Deploy Backend

```bash
# Upload project to server
scp -r insurance-crm-complete/ user@your-server:/opt/

# On server
cd /opt/insurance-crm-complete/backend
npm install --production
cp .env.example .env
nano .env   # set production values

# Start with PM2
pm2 start src/server.js --name insurance-crm-api
pm2 save
pm2 startup   # auto-start on reboot
```

### Deploy Frontend

```bash
cd /opt/insurance-crm-complete/frontend
npm install
# Set VITE_API_URL to your domain
VITE_API_URL=https://api.yourdomain.com/api npm run build
# dist/ folder is now ready to serve
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/insurance-crm

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /opt/insurance-crm-complete/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/insurance-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
# Auto-renewal is set up automatically
```

---

## Option 2 — Docker

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=http://localhost:5000/api
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    restart: always
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: insurance-crm

  backend:
    build: ./backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/insurance-crm
      - JWT_SECRET=change-this-secret
      - FRONTEND_URL=http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./frontend
      args:
        - VITE_API_URL=http://localhost:5000/api
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongo_data:
```

```bash
docker-compose up -d
docker-compose logs -f
```

---

## Option 3 — Cloud Platforms

### Backend on Render.com (Free tier available)

1. Push backend to GitHub
2. New → Web Service → connect repo
3. Build: `npm install` | Start: `node src/server.js`
4. Add environment variables in Render dashboard

### Frontend on Vercel (Free)

```bash
cd frontend
npm install -g vercel
vercel
# Follow prompts, set VITE_API_URL env variable
```

### Frontend on Netlify (Free)

```bash
cd frontend
npm run build
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Production Environment Variables

```env
# backend/.env (production)
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/insurance-crm
JWT_SECRET=use-a-64-character-random-string-generated-with-openssl-rand
JWT_EXPIRE=7d
FRONTEND_URL=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

Generate a strong JWT secret:
```bash
openssl rand -hex 64
```

---

## MongoDB Atlas Setup (Production)

1. Use M10 or higher for production (M0 is for dev only)
2. Enable **VPC Peering** or **Private Endpoints** for security
3. Set up **Backup** (Atlas provides auto-backup on M10+)
4. Whitelist only your server's IP in Network Access
5. Create a dedicated database user with `readWrite` only (not `admin`)

---

## Monitoring & Logs

### PM2 Commands
```bash
pm2 status                    # check all processes
pm2 logs insurance-crm-api   # tail logs
pm2 logs insurance-crm-api --lines 200   # last 200 lines
pm2 restart insurance-crm-api           # restart
pm2 reload insurance-crm-api            # zero-downtime reload
```

### MongoDB Monitoring
- Atlas provides built-in monitoring dashboards
- For self-hosted: use `mongostat` and `mongotop`

### Backup Database
```bash
# Backup
mongodump --uri="your-connection-string" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="your-connection-string" /backup/20260217
```

---

## Performance Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or replica set (not standalone)
- [ ] Enable gzip compression (already in server.js)
- [ ] Set up Nginx reverse proxy with caching
- [ ] Use CDN for frontend static assets
- [ ] Set up SSL/HTTPS
- [ ] Configure log rotation
- [ ] Set up automated backups
- [ ] Monitor memory usage with PM2

---

## Security Checklist

- [ ] Change JWT_SECRET to a long random string
- [ ] Set FRONTEND_URL to your actual domain (not *)
- [ ] Use HTTPS everywhere
- [ ] Whitelist specific IPs in MongoDB Atlas
- [ ] Use a dedicated MongoDB user (not admin)
- [ ] Keep Node.js updated
- [ ] Run `npm audit` regularly
- [ ] Remove seed data from production
- [ ] Disable morgan logging in production (already conditional)
