#!/usr/bin/env node

/**
 * Script de restauration pour Supabase
 * 
 * Ce script permet de :
 * 1. Restaurer la base de données à partir d'un backup
 * 2. Restaurer les fichiers de stockage
 * 3. Vérifier l'intégrité des backups
 * 4. Générer des rapports de restauration
 */

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import readline from 'readline';

// Configuration
const config = {
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Backup
  backupDir: process.env.BACKUP_DIR || './backups',
};

// Interface pour la lecture interactive
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Poser une question à l'utilisateur
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Initialiser le client Supabase
function initSupabase() {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis');
  }
  
  return createClient(config.supabaseUrl, config.supabaseServiceKey);
}

// Lister les backups disponibles
async function listBackups() {
  try {
    const files = await fs.readdir(config.backupDir);
    const backups = [];
    
    for (const file of files) {
      const filePath = path.join(config.backupDir, file);
      const stats = await fs.stat(filePath);
      
      if (file.endsWith('.sql.gz') || file.endsWith('.tar.gz')) {
        backups.push({
          name: file,
          path: filePath,
          size: stats.size,
          date: stats.mtime,
          type: file.includes('database') ? 'database' : 'storage',
        });
      }
    }
    
    // Trier par date (plus récent en premier)
    backups.sort((a, b) => b.date - a.date);
    
    return backups;
  } catch (error) {
    console.error('Erreur lors de la liste des backups:', error);
    throw error;
  }
}

// Afficher les backups disponibles
async function displayBackups() {
  console.log('\n=== BACKUPS DISPONIBLES ===');
  
  const backups = await listBackups();
  
  if (backups.length === 0) {
    console.log('Aucun backup trouvé.');
    return null;
  }
  
  console.log('\nBase de données:');
  const dbBackups = backups.filter(b => b.type === 'database');
  dbBackups.forEach((backup, index) => {
    console.log(`${index + 1}. ${backup.name}`);
    console.log(`   Date: ${backup.date.toLocaleString('fr-FR')}`);
    console.log(`   Taille: ${formatBytes(backup.size)}`);
    console.log('');
  });
  
  console.log('Stockage:');
  const storageBackups = backups.filter(b => b.type === 'storage');
  storageBackups.forEach((backup, index) => {
    console.log(`${dbBackups.length + index + 1}. ${backup.name}`);
    console.log(`   Date: ${backup.date.toLocaleString('fr-FR')}`);
    console.log(`   Taille: ${formatBytes(backup.size)}`);
    console.log('');
  });
  
  return backups;
}

// Formater la taille en octets
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Restaurer la base de données
async function restoreDatabase(backupFile, supabase) {
  try {
    console.log(`\nRestauration de la base de données depuis: ${backupFile}`);
    
    // Décompresser le fichier
    const sqlFile = backupFile.replace('.gz', '');
    execSync(`gunzip -c ${backupFile} > ${sqlFile}`, { stdio: 'inherit' });
    
    // Récupérer les informations de connexion à la base de données
    const { data: { connection }, error } = await supabase
      .rpc('get_db_connection_info');
    
    if (error) {
      throw new Error(`Impossible de récupérer les infos de connexion: ${error.message}`);
    }
    
    // Exécuter la restauration
    console.log('Exécution de la restauration...');
    execSync(`psql ${connection} < ${sqlFile}`, { stdio: 'inherit' });
    
    // Nettoyer le fichier temporaire
    await fs.unlink(sqlFile);
    
    console.log('Restauration de la base de données terminée avec succès.');
  } catch (error) {
    console.error('Erreur lors de la restauration de la base de données:', error);
    throw error;
  }
}

// Restaurer le stockage
async function restoreStorage(backupFile, supabase) {
  try {
    console.log(`\nRestauration du stockage depuis: ${backupFile}`);
    
    // Créer un répertoire temporaire
    const tempDir = path.join(config.backupDir, 'temp-restore');
    await fs.mkdir(tempDir, { recursive: true });
    
    // Extraire l'archive
    execSync(`tar -xzf ${backupFile} -C ${tempDir}`, { stdio: 'inherit' });
    
    // Lister les buckets restaurés
    const buckets = await fs.readdir(tempDir);
    
    for (const bucketName of buckets) {
      console.log(`Restauration du bucket: ${bucketName}`);
      
      const bucketPath = path.join(tempDir, bucketName);
      
      // Créer le bucket s'il n'existe pas
      try {
        await supabase.storage.createBucket(bucketName, { public: false });
        console.log(`Bucket ${bucketName} créé.`);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error(`Erreur lors de la création du bucket ${bucketName}:`, error.message);
        }
      }
      
      // Parcourir les fichiers et les restaurer
      await restoreFiles(bucketPath, bucketName, supabase);
    }
    
    // Nettoyer le répertoire temporaire
    await fs.rm(tempDir, { recursive: true, force: true });
    
    console.log('Restauration du stockage terminée avec succès.');
  } catch (error) {
    console.error('Erreur lors de la restauration du stockage:', error);
    throw error;
  }
}

// Restaurer les fichiers récursivement
async function restoreFiles(dirPath, bucketName, supabase, relativePath = '') {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item.name);
    const itemRelativePath = path.join(relativePath, item.name);
    
    if (item.isDirectory()) {
      // Continuer récursivement
      await restoreFiles(itemPath, bucketName, supabase, itemRelativePath);
    } else {
      // Uploader le fichier
      console.log(`Upload: ${itemRelativePath}`);
      
      const fileBuffer = await fs.readFile(itemPath);
      
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(itemRelativePath, fileBuffer, {
          upsert: true,
        });
      
      if (error) {
        console.error(`Erreur lors de l'upload de ${itemRelativePath}:`, error.message);
      }
    }
  }
}

// Vérifier l'intégrité d'un backup
async function verifyBackup(backupFile) {
  try {
    console.log(`\nVérification de l'intégrité du backup: ${backupFile}`);
    
    if (backupFile.endsWith('.sql.gz')) {
      // Vérifier le fichier SQL compressé
      execSync(`gzip -t ${backupFile}`, { stdio: 'inherit' });
      console.log('Backup de base de données valide.');
    } else if (backupFile.endsWith('.tar.gz')) {
      // Vérifier l'archive tar
      execSync(`tar -tzf ${backupFile} > /dev/null`, { stdio: 'inherit' });
      console.log('Backup de stockage valide.');
    }
    
    return true;
  } catch (error) {
    console.error('Backup corrompu ou invalide:', error.message);
    return false;
  }
}

// Fonction principale
async function main() {
  try {
    console.log('=== UTILITAIRE DE RESTAURATION SUPABASE ===');
    
    // Vérifier la configuration
    if (!config.supabaseUrl || !config.supabaseServiceKey) {
      throw new Error('Configuration Supabase manquante');
    }
    
    // Initialiser Supabase
    const supabase = initSupabase();
    
    // Afficher les backups disponibles
    const backups = await displayBackups();
    
    if (!backups || backups.length === 0) {
      console.log('Aucun backup disponible pour la restauration.');
      return;
    }
    
    // Demander à l'utilisateur de choisir un backup
    const choice = await question('\nEntrez le numéro du backup à restaurer (ou "q" pour quitter): ');
    
    if (choice.toLowerCase() === 'q') {
      console.log('Annulation de la restauration.');
      return;
    }
    
    const index = parseInt(choice) - 1;
    if (isNaN(index) || index < 0 || index >= backups.length) {
      console.log('Choix invalide.');
      return;
    }
    
    const selectedBackup = backups[index];
    
    // Vérifier l'intégrité du backup
    const isValid = await verifyBackup(selectedBackup.path);
    if (!isValid) {
      console.log('Le backup sélectionné est corrompu. Restauration annulée.');
      return;
    }
    
    // Confirmer la restauration
    const confirm = await question(`\nATTENTION: Vous allez restaurer ${selectedBackup.name}.\nCette action écrasera les données actuelles.\nConfirmer? (oui/non): `);
    
    if (confirm.toLowerCase() !== 'oui') {
      console.log('Restauration annulée.');
      return;
    }
    
    // Effectuer la restauration
    if (selectedBackup.type === 'database') {
      await restoreDatabase(selectedBackup.path, supabase);
    } else if (selectedBackup.type === 'storage') {
      await restoreStorage(selectedBackup.path, supabase);
    }
    
    console.log('\n=== RESTAURATION TERMINÉE AVEC SUCCÈS ===');
    
  } catch (error) {
    console.error('\n=== ERREUR LORS DE LA RESTAURATION ===');
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

module.exports = {
  listBackups,
  displayBackups,
  restoreDatabase,
  restoreStorage,
  verifyBackup,
};
