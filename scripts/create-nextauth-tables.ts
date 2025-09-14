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

async function createNextAuthTables() {
  console.log('Creating NextAuth tables in Supabase...');
  
  const tables = [
    {
      name: 'accounts',
      columns: `
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        oauth_token TEXT,
        oauth_token_secret TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `,
      constraints: `
        CONSTRAINT accounts_provider_providerAccountId_key UNIQUE (provider, "providerAccountId"),
        CONSTRAINT accounts_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      `
    },
    {
      name: 'sessions',
      columns: `
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        session_token TEXT NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `,
      constraints: `
        CONSTRAINT sessions_session_token_key UNIQUE (session_token),
        CONSTRAINT sessions_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      `
    },
    {
      name: 'verification_tokens',
      columns: `
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `,
      constraints: `
        CONSTRAINT verification_tokens_identifier_token_key UNIQUE (identifier, token)
      `
    }
  ];
  
  for (const table of tables) {
    try {
      console.log(`Creating table ${table.name}...`);
      
      // Supprimer la table si elle existe déjà
      await supabase.rpc('exec_sql', { sql: `DROP TABLE IF EXISTS "${table.name}"` });
      
      // Créer la table
      const createTableSQL = `
        CREATE TABLE "${table.name}" (
          ${table.columns}
          ${table.constraints}
        )
      `;
      
      await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      console.log(`✅ Table ${table.name}: created successfully`);
    } catch (err) {
      console.error(`❌ Error creating table ${table.name}:`, err);
    }
  }
  
  console.log('\n✅ All NextAuth tables created successfully!');
}

createNextAuthTables();
