# Déploiement de NOLI Motor

Ce document explique comment déployer l'application NOLI Motor en production.

## Prérequis

- Node.js 18+
- npm ou yarn
- Un compte sur une plateforme de déploiement (Vercel recommandé)
- Une base de données (PostgreSQL recommandé pour la production)

## Configuration initiale

### 1. Cloner le dépôt
```bash
git clone <votre-repo>
cd noli-motor
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement

Copiez le fichier d'exemple et adaptez-le :
```bash
cp .env.example .env.production
```

Éditez `.env.production` avec vos valeurs :
```bash
# Base de données
DATABASE_URL="postgresql://username:password@hostname:port/database"

# NextAuth.js
NEXTAUTH_SECRET="votre-secret-très-long-et-sécurisé"
NEXTAUTH_URL="https://votre-domaine.com"

# Email (optionnel)
EMAIL_SERVER_HOST="smtp.votreserveur.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="votre_email"
EMAIL_SERVER_PASSWORD="votre_mot_de_passe"
EMAIL_FROM="noreply@votre-domaine.com"
```

## Migration de la base de données

Les migrations SQL sont stockées dans `supabase/migrations` et sont gérées via la CLI Supabase.

### Installer la CLI

```bash
npm install -g supabase
```

### Appliquer les migrations

```bash
supabase db push
```

### Réinitialiser la base locale

```bash
supabase db reset --local
```

### Peupler la base avec des données de test

```bash
npm run db:seed
```

## Build de l'application

```bash
# Build de production
npm run build

# Vérifier le build localement
npm start
```

## Options de déploiement

### Option A: Vercel (recommandé)

1. **Créer un compte sur [Vercel](https://vercel.com)**
2. **Importer votre projet GitHub**
3. **Configurer les variables d'environnement** :
   - Allez dans Settings > Environment Variables
   - Ajoutez toutes les variables de `.env.production`

4. **Déployer** :
   ```bash
   npm install -g vercel
   vercel --prod
   ```

5. **Configuration personnalisée** (vercel.json) :
   ```json
   {
     "build": {
       "env": {
         "NEXTAUTH_URL": "https://votre-domaine.vercel.app"
       }
     }
   }
   ```

### Option B: Docker

1. **Construire l'image** :
```bash
docker build -t noli-motor .
```

2. **Lancer avec Docker Compose** :
```yaml
version: '3.8'
services:
  app:
    image: noli-motor
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/noli
      - NEXTAUTH_SECRET=votre-secret
      - NEXTAUTH_URL=https://votre-domaine.com
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: noli
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

3. **Lancer** :
```bash
docker-compose up -d
```

### Option C: Serveur dédié avec PM2

1. **Uploader les fichiers** sur votre serveur
2. **Installer Node.js et PM2** :
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2
```

3. **Configurer l'application** :
```bash
npm install --production
npm run build
```

4. **Créer un fichier ecosystem.config.js** :
```javascript
module.exports = {
  apps: [{
    name: 'noli-motor',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/noli',
      NEXTAUTH_SECRET: 'votre-secret',
      NEXTAUTH_URL: 'https://votre-domaine.com'
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

5. **Lancer avec PM2** :
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Post-déploiement

### Vérifications essentielles

1. **Tester l'application** :
   - Page d'accueil : `https://votre-domaine.com`
   - Connexion : `https://votre-domaine.com/connexion`
   - Inscription : `https://votre-domaine.com/inscription`
   - Comparateur : `https://votre-domaine.com/comparateur`

2. **Vérifier les tableaux de bord** :
   - User : `/dashboard`
   - Assureur : `/dashboard`
   - Admin : `/dashboard`

3. **Tester le formulaire** :
   - Soumettre un devis
   - Vérifier la création d'assureur (admin)

### Configuration du domaine

1. **Configurer votre domaine** dans la plateforme de déploiement
2. **Activer HTTPS** (généralement automatique)
3. **Configurer les DNS** si nécessaire

### Monitoring

1. **Logs de l'application** :
   ```bash
   # Vercel
   vercel logs noli-motor

   # PM2
   pm2 logs noli-motor

   # Docker
   docker logs noli-motor
   ```

2. **Monitoring des performances** :
   - Utiliser Vercel Analytics
   - Configurer Google Analytics
   - Mettre en place un monitoring d'erreurs (Sentry, etc.)

## Maintenance

### Mises à jour

```bash
# 1. Pull des dernières modifications
git pull origin main

# 2. Mise à jour des dépendances
npm install

# 3. Migration de la base de données
npm run db:migrate:deploy

# 4. Build et redémarrage
npm run build
pm2 restart noli-motor
```

### Sauvegardes

1. **Base de données** :
   ```bash
   # PostgreSQL
   pg_dump noli > backup_$(date +%Y%m%d).sql

   # Restaurer
   psql noli < backup_20240101.sql
   ```

2. **Fichiers** :
   - Sauvegarder le répertoire `uploads` si vous avez des uploads
   - Sauvegarder les fichiers de configuration

## Sécurité

### En production

- [x] Utiliser HTTPS
- [x] Configurer les headers de sécurité
- [x] Utiliser des variables d'environnement
- [x] Ne jamais exposer les secrets
- [x] Configurer le rate limiting
- [x] Utiliser des mots de passe forts

### Base de données

- [x] Restreindre l'accès à la base de données
- [x] Utiliser des connexions SSL
- [x] Configurer les backups automatiques
- [x] Surveiller les performances

## Dépannage

### Problèmes courants

1. **Build échoue** :
   ```bash
   # Vérifier les dépendances
   npm install
   
   # Vérifier les variables d'environnement
   npm run build
   ```

2. **Base de données inaccessible** :
   ```bash
   # Vérifier la connexion
   supabase status

   # Vérifier les migrations
   supabase db push
   ```

3. **Pages 404** :
   - Vérifier le routage
   - Vérifier la configuration du déploiement

4. **Authentification échoue** :
   - Vérifier NEXTAUTH_SECRET et NEXTAUTH_URL
   - Vérifier la configuration des cookies

### Support

Pour toute question :
- Vérifier les logs de l'application
- Consulter la documentation de Next.js
- Contacter l'équipe de développement

## Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Build réussi
- [ ] Application accessible
- [ ] HTTPS activé
- [ ] Domaine configuré
- [ ] Emails fonctionnels (si configuré)
- [ ] Monitoring en place
- [ ] Sauvegardes configurées
- [ ] Sécurité vérifiée

---

**Note** : Ce guide suppose que vous avez les accès nécessaires à la plateforme de déploiement et à la base de données. Adaptez les commandes selon votre environnement spécifique.