import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Charger les variables d'environnement
config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkNextAuthTables() {
  console.log('Checking NextAuth tables in Supabase...');
  
  const tables = ['users', 'accounts', 'sessions', 'verification_tokens'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table ${table}:`, error.message);
      } else {
        console.log(`✅ Table ${table}: exists`);
      }
    } catch (err) {
      console.error(`❌ Table ${table}: unexpected error`, err);
    }
  }
  
  // Vérifier le schéma actuel
  console.log('\nChecking current schema...');
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_schema, table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('Error querying schema:', error.message);
    } else {
      console.log('Tables in public schema:', data?.map(t => t.table_name) || []);
    }
  } catch (err) {
    console.error('Error checking schema:', err);
  }
}

checkNextAuthTables();
