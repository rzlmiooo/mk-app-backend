# Setup Backend

```
pm2 delete mk-app-backend || true
pm2 start bun --name "mk-app-backend" -- build \
        --compile \
        --minify-whitespace \
        --minify-syntax \
        --outfile server \
        src/index.ts 
        ./server
pm2 save
pm2 startup -u $USER --hp $HOME
```
## new
```
pm2 delete mk-app-backend || true

# build sekali
bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --outfile server \
  src/index.ts

# jalanin binary hasil build
pm2 start ./server --name "mk-app-backend" --interpreter none \
  --restart-delay=5000 --max-restarts=0

pm2 save
pm2 startup -u $USER --hp $HOME
```
```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:rzlmiooo/mk-app-backend.git
git push -u origin main

sudo nano /etc/nginx/sites-available/mk-app-backend
sudo ln -s /etc/nginx/sites-available/mk-app-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

server {
    listen 80;
    server_name mkapp.qzz.io www.mkapp.qzz.io;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

sudo ln -s /etc/nginx/sites-available/mk-app-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

sudo certbot --nginx -d mkapp.qzz.io -d www.mkapp.qzz.io
```

# setup postgre
### Install Postgre
```
sudo apt install postgresql postgresql-contrib -y
sudo systemctl status postgresql
```
### login postgre
```
sudo -i -u postgres
psql
```
### buat db
```
CREATE USER rizal WITH PASSWORD 'miooo123';
CREATE DATABASE mkapp OWNER rizal;
GRANT ALL PRIVILEGES ON DATABASE mkapp TO rizal;
\q
```
### remote access
```
sudo nano /etc/postgresql/16/main/postgresql.conf
listen_addresses = '*'
sudo nano /etc/postgresql/15/main/pg_hba.conf
host    all             all             0.0.0.0/0               md5
sudo systemctl restart postgresql
```
### tes koneksi
```
psql -h 3.95.24.184 -U rizal -d mkapp
```

### pm2 config
```
module.exports = {
  apps: [
    {
      name: "mk-app-backend",
      script: "run src/index.ts",
      interpreter: "bun",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
      },
    },
  ],
};
```