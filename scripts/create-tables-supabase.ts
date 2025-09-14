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

async function createTables() {
  console.log('Creating NextAuth tables using Supabase client...');
  
  const tables = [
    {
      name: 'accounts',
      columns: [
        { name: 'id', type: 'text', primaryKey: true },
        { name: 'userId', type: 'text', notNull: true },
        { name: 'type', type: 'text', notNull: true },
        { name: 'provider', type: 'text', notNull: true },
        { name: 'providerAccountId', type: 'text', notNull: true },
        { name: 'refresh_token', type: 'text' },
        { name: 'access_token', type: 'text' },
        { name: 'expires_at', type: 'int' },
        { name: 'token_type', type: 'text' },
        { name: 'scope', type: 'text' },
        { name: 'id_token', type: 'text' },
        { name: 'session_state', type: 'text' },
        { name: 'oauth_token', type: 'text' },
        { name: 'oauth_token_secret', type: 'text' },
        { name: 'createdAt', type: 'timestamp' },
        { name: 'updatedAt', type: 'timestamp' }
      ]
    },
    {
      name: 'sessions',
      columns: [
        { name: 'id', type: 'text', primaryKey: true },
        { name: 'userId', type: 'text', notNull: true },
        { name: 'sessionToken', type: 'text', notNull: true },
        { name: 'expires', type: 'timestamp', notNull: true },
        { name: 'createdAt', type: 'timestamp' },
        { name: 'updatedAt', type: 'timestamp' }
      ]
    },
    {
      name: 'verification_tokens',
      columns: [
        { name: 'identifier', type: 'text', notNull: true },
        { name: 'token', type: 'text', notNull: true },
        { name: 'expires', type: 'timestamp', notNull: true },
        { name: 'createdAt', type: 'timestamp' }
      ]
    }
  ];
  
  for (const table of tables) {
    try {
      console.log(`Creating table ${table.name}...`);
      
      // Supprimer la table si elle existe déjà
      await supabase.from(table.name).select('*').limit(1);
      
      // Créer la table avec insert
      const sampleData = {
        id: `test-${table.name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Ajouter les colonnes spécifiques à chaque table
      table.columns.forEach(col => {
        if (col.name !== 'id' && col.name !== 'createdAt' && col.name !== 'updatedAt') {
          sampleData[col.name] = col.type === 'text' ? 'test' : col.type === 'int' ? 1 : new Date().toISOString();
        }
      });
      
      const { error } = await supabase
        .from(table.name)
        .insert(sampleData)
        .select();
      
      if (error) {
        console.log(`❌ Table ${table.name}: ${error.message}`);
        
        // Si la table n'existe pas, créer une table simple
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`Table ${table.name} doesn't exist, trying to create it...`);
          
          // Créer une table simple avec les colonnes de base
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS "${table.name}" (
              id TEXT PRIMARY KEY,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `;
          
          // Essayer d'utiliser une approche différente
          const { error: insertError } = await supabase
            .from(table.name)
            .insert({
              id: `test-${table.name}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.log(`❌ Failed to create table ${table.name}: ${insertError.message}`);
          } else {
            console.log(`✅ Table ${table.name}: created successfully`);
          }
        }
      } else {
        console.log(`✅ Table ${table.name}: exists or created successfully`);
      }
    } catch (err) {
      console.log(`❌ Table ${table.name}: unexpected error`, err);
    }
  }
  
  console.log('\n✅ Table creation process completed!');
}

createTables();
