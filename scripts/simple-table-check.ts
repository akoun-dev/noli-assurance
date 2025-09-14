import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Charger les variables d'environnement
config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function simpleTableCheck() {
  console.log('Checking tables directly...');
  
  const tables = ['users', 'accounts', 'sessions', 'verification_tokens'];
  
  for (const table of tables) {
    try {
      console.log(`\nChecking table ${table}...`);
      
      // Essayer de sélectionner une ligne
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
        
        // Essayer de créer la table si elle n'existe pas
        if (error.message.includes('Could not find the table')) {
          console.log(`Attempting to create table ${table}...`);
          
          // Créer la table avec une structure simple
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS "${table}" (
              id TEXT PRIMARY KEY,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `;
          
          const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
          
          if (createError) {
            console.log(`❌ Failed to create table ${table}: ${createError.message}`);
          } else {
            console.log(`✅ Table ${table}: created successfully`);
          }
        }
      } else {
        console.log(`✅ Table ${table}: exists`);
        console.log(`Sample data:`, data);
      }
    } catch (err) {
      console.log(`❌ Table ${table}: unexpected error`, err);
    }
  }
}

simpleTableCheck();
