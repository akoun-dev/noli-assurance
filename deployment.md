# Déploiement sur Serveur Dédié avec PM2

## Prérequis
- Serveur Linux (Ubuntu/Debian recommandé)
- Node.js v18+
- NPM v9+
- PM2 installé globalement (`npm install -g pm2`)
- Git installé

## 1. Installation des dépendances

```bash
# Mettre à jour les paquets
sudo apt update && sudo apt upgrade -y

# Installer Node.js et NPM
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier les versions
node -v
npm -v

# Installer PM2 globalement
sudo npm install -g pm2
```

## 2. Configuration du Projet

```bash
# Cloner le dépôt
git clone https://github.com/votre-repo/noli.git
cd noli

# Installer les dépendances
npm install

# Créer le fichier .env de production
cp .env.example .env.production
nano .env.production  # Éditer avec vos configurations
```

## 3. Build de l'Application

```bash
# Build de production
npm run build

# Vérifier que le build s'est bien passé
ls -la .next/
```

## 4. Configuration PM2

Créer un fichier `ecosystem.config.js` à la racine :

```javascript
module.exports = {
  apps: [{
    name: 'noli-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## 5. Démarrage avec PM2

```bash
# Démarrer l'application
pm2 start ecosystem.config.js

# Configurer le démarrage automatique
pm2 startup
pm2 save

# Vérifier le statut
pm2 status
pm2 logs
```

## 6. Configuration Nginx (Optionnel)

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/noli
```

Ajouter cette configuration :

```nginx
server {
    listen 80;
    server_name votredomaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activer la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/noli /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Commandes PM2 Utiles

```bash
# Surveiller les logs
pm2 logs

# Redémarrer l'application
pm2 restart noli-app

# Arrêter l'application
pm2 stop noli-app

# Supprimer de PM2
pm2 delete noli-app

# Monitorer les performances
pm2 monit
```

## 8. Mises à Jour

Pour déployer une nouvelle version :

```bash
git pull origin main
npm install
npm run build
pm2 restart noli-app
```

## Sécurité Recommandée

- Configurer un firewall (UFW)
- Utiliser HTTPS avec Let's Encrypt
- Mettre à jour régulièrement les dépendances
- Configurer des sauvegardes automatiques