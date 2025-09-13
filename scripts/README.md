# Système de Backup et Restauration pour Noli Assurance

Ce document décrit le système de backup automatisé mis en place pour l'application Noli Assurance.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration](#configuration)
3. [Scripts disponibles](#scripts-disponibles)
4. [Procédures](#procédures)
5. [Dépannage](#dépannage)
6. [Sécurité](#sécurité)

## Vue d'ensemble

Le système de backup permet de :

- **Sauvegarder automatiquement** la base de données Supabase
- **Sauvegarder les fichiers** de stockage (documents, images, etc.)
- **Compresser et archiver** les backups
- **Nettoyer les anciens backups** selon une politique de rétention
- **Envoyer des notifications** par email en cas de succès ou d'échec
- **Restaurer facilement** les données à partir des backups

### Composants principaux

1. **`backup.js`** - Script principal de backup
2. **`restore.js`** - Script de restauration interactive
3. **`backup-config.json`** - Fichier de configuration
4. **Cron job** - Pour l'automatisation des backups

## Configuration

### Variables d'environnement

Les variables d'environnement suivantes doivent être configurées :

```bash
# Supabase
SUPABASE_URL=votre-url-supabase
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service

# Backup
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
COMPRESSION_LEVEL=6

# Email notifications
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe
ADMIN_EMAIL=admin@noli-assurance.com
```

### Fichier de configuration

Le fichier `backup-config.json` permet de configurer :

- **Horaires des backups** (cron schedule)
- **Rétention des backups** (nombre de jours)
- **Notifications** (email, Slack)
- **Sécurité** (chiffrement, authentification)
- **Stockage cloud** (optionnel)

Exemple de configuration :
```json
{
  "backup": {
    "directory": "./backups",
    "retentionDays": 30,
    "schedule": "0 2 * * *",
    "enabled": true
  }
}
```

## Scripts disponibles

### backup.js

Script principal pour effectuer les backups.

**Usage :**
```bash
# Exécution manuelle
node scripts/backup.js

# Avec variables d'environnement
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backup.js
```

**Fonctionnalités :**
- Backup de la base de données avec `pg_dump`
- Backup des buckets de stockage
- Compression des fichiers
- Nettoyage des anciens backups
- Envoi de notifications email

### restore.js

Script interactif pour restaurer les données.

**Usage :**
```bash
# Lancement du script
node scripts/restore.js
```

**Fonctionnalités :**
- Liste des backups disponibles
- Vérification de l'intégrité des backups
- Restauration interactive
- Confirmation avant restauration

## Procédures

### 1. Configuration initiale

1. **Installer les dépendances :**
   ```bash
   npm install nodemailer @supabase/supabase-js
   ```

2. **Configurer les variables d'environnement :**
   - Créer un fichier `.env.local`
   - Copier les variables depuis `.env.example`

3. **Tester la configuration :**
   ```bash
   node scripts/backup.js
   ```

### 2. Automatisation avec Cron

Pour configurer des backups automatiques :

1. **Ouvrir le crontab :**
   ```bash
   crontab -e
   ```

2. **Ajouter la ligne suivante :**
   ```bash
   0 2 * * * cd /chemin/vers/votre/projet && node scripts/backup.js >> /var/log/backup.log 2>&1
   ```

   Ceci exécutera le backup tous les jours à 2h du matin.

3. **Vérifier le cron :**
   ```bash
   crontab -l
   ```

### 3. Procédure de backup manuel

1. **Naviguer vers le répertoire du projet :**
   ```bash
   cd /chemin/vers/votre/projet
   ```

2. **Exécuter le script :**
   ```bash
   node scripts/backup.js
   ```

3. **Vérifier les résultats :**
   ```bash
   ls -la backups/
   ```

### 4. Procédure de restauration

1. **Lancer le script de restauration :**
   ```bash
   node scripts/restore.js
   ```

2. **Choisir le backup à restaurer :**
   - Le script affiche la liste des backups disponibles
   - Entrer le numéro correspondant

3. **Confirmer la restauration :**
   - Le script demande une confirmation
   - Taper "oui" pour continuer

4. **Attendre la fin de la restauration :**
   - Le script affiche la progression
   - Un rapport est généré à la fin

### 5. Vérification des backups

1. **Lister les backups disponibles :**
   ```bash
   ls -la backups/
   ```

2. **Vérifier l'intégrité :**
   ```bash
   # Pour les backups de base de données
   gzip -t backups/database-backup-*.sql.gz
   
   # Pour les backups de stockage
   tar -tzf backups/storage-*.tar.gz
   ```

3. **Consulter les logs :**
   ```bash
   tail -f logs/backup.log
   ```

## Dépannage

### Problèmes courants

#### 1. Erreur de connexion à Supabase

**Symptôme :**
```
Error: SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis
```

**Solution :**
- Vérifier les variables d'environnement
- S'assurer que les clés sont valides
- Tester la connexion avec un client SQL

#### 2. Erreur de permissions

**Symptôme :**
```
Error: EACCES: permission denied
```

**Solution :**
- Vérifier les permissions du répertoire de backups
- Exécuter le script avec l'utilisateur approprié
- Changer les permissions si nécessaire :
  ```bash
  chmod 755 backups/
  ```

#### 3. Erreur d'email

**Symptôme :**
```
Error: Invalid login
```

**Solution :**
- Vérifier les identifiants SMTP
- S'assurer que le mot de passe est correct
- Tester avec un client email

#### 4. Espace disque insuffisant

**Symptôme :**
```
Error: No space left on device
```

**Solution :**
- Vérifier l'espace disponible :
  ```bash
  df -h
  ```
- Nettoyer les anciens backups
- Augmenter l'espace disque

### Logs et monitoring

1. **Logs du backup :**
   ```bash
   tail -f logs/backup.log
   ```

2. **Logs système :**
   ```bash
   journalctl -u backup -f
   ```

3. **Monitoring des backups :**
   - Vérifier la taille des fichiers de backup
   - Surveiller l'espace disque utilisé
   - Vérifier les notifications email

## Sécurité

### Bonnes pratiques

1. **Protection des clés :**
   - Ne jamais commettre les clés Supabase
   - Utiliser des variables d'environnement
   - Restreindre l'accès au fichier de configuration

2. **Sécurité des backups :**
   - Stocker les backups dans un endroit sécurisé
   - Chiffrer les backups sensibles
   - Limiter l'accès aux fichiers de backup

3. **Contrôle d'accès :**
   - Restreindre l'exécution des scripts aux utilisateurs autorisés
   - Utiliser des permissions appropriées
   - Auditer régulièrement les accès

### Chiffrement des backups

Pour activer le chiffrement des backups :

1. **Modifier la configuration :**
   ```json
   {
     "security": {
       "encryptBackups": true,
       "encryptionKey": "votre-cle-de-chiffrement"
     }
   }
   ```

2. **Générer une clé de chiffrement :**
   ```bash
   openssl rand -hex 32
   ```

3. **Stocker la clé en sécurité :**
   - Utiliser un gestionnaire de mots de passe
   - Ne pas stocker la clé dans le code
   - Limiter l'accès à la clé

## Support

En cas de problème ou de question :

1. **Consulter les logs** pour identifier l'erreur
2. **Vérifier la configuration** des variables d'environnement
3. **Tester manuellement** les scripts
4. **Contacter l'équipe technique** si le problème persiste

---

*Document généré automatiquement - Dernière mise à jour : 2025-09-13*
