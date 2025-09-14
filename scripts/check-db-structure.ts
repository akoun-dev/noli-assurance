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

async function checkDBStructure() {
  console.log('Checking database structure...');
  
  try {
    // Vérifier les tables existantes
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return;
    }
    
    console.log('\nTables in public schema:');
    if (tables && tables.length > 0) {
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    } else {
      console.log('No tables found in public schema');
    }
    
    // Vérifier spécifiquement les tables NextAuth
    const nextAuthTables = ['users', 'accounts', 'sessions', 'verification_tokens'];
    console.log('\nNextAuth tables status:');
    
    for (const table of nextAuthTables) {
      const exists = tables?.some(t => t.table_name === table);
      console.log(`- ${table}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }
    
    // Essayer de lister toutes les schémas
    const { data: schemas, error: schemasError } = await supabase
      .from('information_schema.schemata')
      .select('schema_name');
    
    if (schemasError) {
      console.error('Error fetching schemas:', schemasError);
    } else {
      console.log('\nAvailable schemas:');
      console.log(schemas?.map(s => s.schema_name).join(', ') || 'No schemas found');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkDBStructure();
