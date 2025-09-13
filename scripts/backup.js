#!/usr/bin/env node

/**
 * Script de backup automatisé pour Supabase
 * 
 * Ce script permet de :
 * 1. Créer des backups de la base de données Supabase
 * 2. Sauvegarder les fichiers de stockage
 * 3. Compresser et archiver les backups
 * 4. Nettoyer les anciens backups selon la politique de rétention
 * 5. Envoyer des notifications par email en cas de succès ou d'échec
 */

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Configuration
const config = {
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Backup
  backupDir: process.env.BACKUP_DIR || './backups',
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  
  // Email notifications
  emailEnabled: process.env.EMAIL_ENABLED === 'true',
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  adminEmail: process.env.ADMIN_EMAIL || 'admin@noli-assurance.com',
  
  // Compression
  compressionLevel: parseInt(process.env.COMPRESSION_LEVEL || '6'),
};

// Créer le répertoire de backup s'il n'existe pas
async function ensureBackupDir() {
  try {
    await fs.mkdir(config.backupDir, { recursive: true });
    console.log(`Répertoire de backup créé/vérifié: ${config.backupDir}`);
  } catch (error) {
    console.error('Erreur lors de la création du répertoire de backup:', error);
    throw error;
  }
}

// Initialiser le client Supabase
function initSupabase() {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis');
  }
  
  return createClient(config.supabaseUrl, config.supabaseServiceKey);
}

// Générer un nom de fichier de backup avec timestamp
function generateBackupName(type, extension = 'sql') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const hash = crypto.randomBytes(4).toString('hex');
  return `${type}-backup-${timestamp}-${hash}.${extension}`;
}

// Exécuter la commande pg_dump pour le backup de la base de données
async function backupDatabase(supabase) {
  try {
    console.log('Début du backup de la base de données...');
    
    // Récupérer les informations de connexion à la base de données
    const { data: { connection }, error } = await supabase
      .rpc('get_db_connection_info');
    
    if (error) {
      throw new Error(`Impossible de récupérer les infos de connexion: ${error.message}`);
    }
    
    const backupFile = path.join(config.backupDir, generateBackupName('database', 'sql'));
    
    // Construire la commande pg_dump
    const pgDumpCmd = `pg_dump ${connection} --no-owner --no-privileges --file=${backupFile}`;
    
    console.log('Exécution de pg_dump...');
    execSync(pgDumpCmd, { stdio: 'inherit' });
    
    // Compresser le fichier
    const compressedFile = `${backupFile}.gz`;
    execSync(`gzip -${config.compressionLevel} ${backupFile}`, { stdio: 'inherit' });
    
    console.log(`Backup de la base de données terminé: ${compressedFile}`);
    return compressedFile;
  } catch (error) {
    console.error('Erreur lors du backup de la base de données:', error);
    throw error;
  }
}

// Lister et sauvegarder les buckets de stockage
async function backupStorage(supabase) {
  try {
    console.log('Début du backup du stockage...');
    
    // Lister tous les buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Impossible de lister les buckets: ${bucketsError.message}`);
    }
    
    const backupFiles = [];
    
    for (const bucket of buckets) {
      console.log(`Backup du bucket: ${bucket.name}`);
      
      // Créer un répertoire pour ce bucket
      const bucketDir = path.join(config.backupDir, 'storage', bucket.name);
      await fs.mkdir(bucketDir, { recursive: true });
      
      // Lister tous les fichiers dans le bucket
      const { data: files, error: filesError } = await supabase.storage
        .from(bucket.name)
        .list('', { limit: 1000 });
      
      if (filesError) {
        console.error(`Erreur lors du listage des fichiers dans ${bucket.name}:`, filesError.message);
        continue;
      }
      
      // Télécharger chaque fichier
      for (const file of files) {
        if (file.id) { // Ignorer les dossiers
          const filePath = path.join(bucketDir, file.name);
          const fileDir = path.dirname(filePath);
          
          await fs.mkdir(fileDir, { recursive: true });
          
          const { data: fileData, error: downloadError } = await supabase.storage
            .from(bucket.name)
            .download(file.name);
          
          if (downloadError) {
            console.error(`Erreur lors du téléchargement de ${file.name}:`, downloadError.message);
            continue;
          }
          
          await fs.writeFile(filePath, fileData);
          console.log(`Fichier sauvegardé: ${filePath}`);
        }
      }
      
      // Créer une archive du bucket
      const archiveFile = path.join(config.backupDir, generateBackupName(`storage-${bucket.name}`, 'tar.gz'));
      execSync(`tar -czf ${archiveFile} -C ${path.join(config.backupDir, 'storage')} ${bucket.name}`, { stdio: 'inherit' });
      
      backupFiles.push(archiveFile);
      
      // Nettoyer le répertoire temporaire
      await fs.rm(path.join(config.backupDir, 'storage'), { recursive: true, force: true });
    }
    
    console.log(`Backup du stockage terminé. ${backupFiles.length} archives créées.`);
    return backupFiles;
  } catch (error) {
    console.error('Erreur lors du backup du stockage:', error);
    throw error;
  }
}

// Nettoyer les anciens backups selon la politique de rétention
async function cleanupOldBackups() {
  try {
    console.log(`Nettoyage des backups de plus de ${config.retentionDays} jours...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);
    
    const files = await fs.readdir(config.backupDir);
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(config.backupDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        await fs.unlink(filePath);
        console.log(`Ancien backup supprimé: ${filePath}`);
        deletedCount++;
      }
    }
    
    console.log(`Nettoyage terminé. ${deletedCount} fichiers supprimés.`);
    return deletedCount;
  } catch (error) {
    console.error('Erreur lors du nettoyage des anciens backups:', error);
    throw error;
  }
}

// Envoyer une notification par email
async function sendEmail(subject, body, isError = false) {
  if (!config.emailEnabled) {
    console.log('Notifications email désactivées.');
    return;
  }
  
  try {
    const transporter = nodemailer.createTransporter({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
    
    const mailOptions = {
      from: config.smtpUser,
      to: config.adminEmail,
      subject: `[Backup Noli Assurance] ${subject}`,
      html: `
        <h2>${subject}</h2>
        <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        <p><strong>Type:</strong> ${isError ? 'ERREUR' : 'SUCCÈS'}</p>
        <hr>
        <div style="font-family: monospace; white-space: pre-wrap;">${body}</div>
        <hr>
        <p><em>Ce message a été généré automatiquement par le système de backup.</em></p>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Notification email envoyée avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
}

// Fonction principale
async function main() {
  const startTime = new Date();
  let backupFiles = [];
  let error = null;
  
  try {
    console.log('=== DÉBUT DU BACKUP AUTOMATISÉ ===');
    console.log(`Heure de début: ${startTime.toLocaleString('fr-FR')}`);
    
    // Vérifier la configuration
    if (!config.supabaseUrl || !config.supabaseServiceKey) {
      throw new Error('Configuration Supabase manquante');
    }
    
    // Créer le répertoire de backup
    await ensureBackupDir();
    
    // Initialiser Supabase
    const supabase = initSupabase();
    
    // Backup de la base de données
    const dbBackupFile = await backupDatabase(supabase);
    backupFiles.push(dbBackupFile);
    
    // Backup du stockage
    const storageBackupFiles = await backupStorage(supabase);
    backupFiles.push(...storageBackupFiles);
    
    // Nettoyer les anciens backups
    const deletedCount = await cleanupOldBackups();
    
    // Générer un rapport
    const endTime = new Date();
    const duration = endTime - startTime;
    
    const report = `
=== RAPPORT DE BACKUP ===
Heure de début: ${startTime.toLocaleString('fr-FR')}
Heure de fin: ${endTime.toLocaleString('fr-FR')}
Durée totale: ${Math.round(duration / 1000)} secondes

Fichiers de backup créés:
${backupFiles.map(f => `- ${path.basename(f)}`).join('\n')}

Anciens backups supprimés: ${deletedCount}

Configuration:
- Rétention: ${config.retentionDays} jours
- Répertoire: ${config.backupDir}
- Compression niveau: ${config.compressionLevel}
`;
    
    console.log(report);
    
    // Envoyer une notification de succès
    await sendEmail(
      'Backup réussi',
      report + '\n\nLe backup s\'est déroulé avec succès.'
    );
    
    console.log('=== BACKUP TERMINÉ AVEC SUCCÈS ===');
    
  } catch (err) {
    error = err;
    console.error('=== ERREUR LORS DU BACKUP ===');
    console.error(err);
    
    // Envoyer une notification d'erreur
    await sendEmail(
      'Échec du backup',
      `Une erreur est survenue lors du backup:\n\n${err.stack || err.message}`,
      true
    );
    
    process.exit(1);
  }
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

module.exports = {
  main,
  ensureBackupDir,
  backupDatabase,
  backupStorage,
  cleanupOldBackups,
  sendEmail,
};
