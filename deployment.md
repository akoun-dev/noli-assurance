# Guide de Déploiement - NOLI Motor

## Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte sur plateforme de déploiement (Vercel, Netlify, etc.)
- Base de données (SQLite pour développement, PostgreSQL/MySQL pour production)

## 1. Configuration des variables d'environnement

### Développement (.env.development)
```bash
cp .env.development .env
```

### Production (.env.production)
```bash
# Base de données
DATABASE_URL="postgresql://username:password@hostname:port/database"

# NextAuth.js
NEXTAUTH_SECRET="GENERATE_A_SECURE_SECRET_HERE_MINIMUM_32_CHARACTERS"
NEXTAUTH_URL="https://votre-domaine.com"

# Email (optionnel)
EMAIL_SERVER_HOST="smtp.votreserveur.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="votre_email@votreserveur.com"
EMAIL_SERVER_PASSWORD="votre_mot_de_passe_email"
EMAIL_FROM="noreply@votre-domaine.com"
```

## 2. Migration de la base de données

### Pour le développement (SQLite) :
```bash
# Appliquer le schéma
npx prisma db push

# Générer le client Prisma
npx prisma generate

# Peupler la base de données
npx prisma db seed
```

### Pour la production (PostgreSQL/MySQL) :
```bash
# Appliquer les migrations
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate

# Peupler la base de données (optionnel)
npx prisma db seed
```

## 3. Build de l'application

```bash
# Installer les dépendances
npm install

# Build de production
npm run build

# Lancer en production localement pour tester
npm start
```

## 4. Options de déploiement

### Option A: Vercel (recommandé)

1. **Connecter votre dépôt GitHub à Vercel**
2. **Configurer les variables d'environnement** dans le dashboard Vercel
3. **Déployer automatiquement** à chaque push sur la branche principale

Configuration recommandée :
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Option B: Docker

1. **Construire l'image** :
```bash
docker build -t noli-motor .
```

2. **Lancer le conteneur** :
```bash
docker run -p 3000:3000 --env-file .env.production noli-motor
```

### Option C: Serveur dédié

1. **Uploader les fichiers** sur le serveur
2. **Installer les dépendances** : `npm install --production`
3. **Build l'application** : `npm run build`
4. **Lancer avec PM2** :
```bash
npm install -g pm2
pm2 start npm --name "noli-motor" -- start
```

## 5. Post-déploiement

### Vérifications essentielles :
- [ ] L'application est accessible sur votre domaine
- [ ] Les pages principales fonctionnent (accueil, connexion, inscription)
- [ ] Le formulaire de comparaison fonctionne
- [ ] Les tableaux de bord s'affichent correctement
- [ ] Les emails sont envoyés (si configuré)
- [ ] La base de données est accessible

### Monitoring :
- Configurer les logs de production
- Mettre en place le monitoring des erreurs
- Surveiller les performances

## 6. Maintenance

### Mises à jour :
```bash
# Pull des dernières modifications
git pull origin main

# Mise à jour des dépendances
npm install

# Migration de la base de données si nécessaire
npx prisma migrate deploy

# Redémarrer l'application
pm2 restart noli-motor
```

### Sauvegardes :
- Sauvegarder régulièrement la base de données
- Sauvegarder les fichiers uploadés
- Tester la restauration des sauvegardes

## 7. Sécurité

### En production :
- [ ] Utiliser HTTPS
- [ ] Configurer les headers de sécurité
- [ ] Mettre en place le rate limiting
- [ ] Utiliser des variables d'environnement pour les secrets
- [ ] Ne jamais exposer les clés d'API dans le code client

### Base de données :
- [ ] Utiliser des mots de passe forts
- [ ] Restreindre l'accès à la base de données
- [ ] Configurer les backups automatiques

## 8. Dépannage

### Problèmes courants :
1. **Build échoue** : Vérifier les dépendances et les variables d'environnement
2. **Base de données inaccessible** : Vérifier la chaîne de connexion et les permissions
3. **Pages 404** : Vérifier le routage et la configuration du déploiement
4. **Lent** : Optimiser les images et utiliser le caching

### Logs :
```bash
# Voir les logs de l'application
pm2 logs noli-motor

# Voir les logs de la base de données
# Vérifier les logs de votre service de base de données
```

## Support

Pour toute question ou problème, contactez l'équipe de développement.