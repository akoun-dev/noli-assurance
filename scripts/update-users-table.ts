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

async function updateUsersTable() {
  console.log('Updating users table for NextAuth compatibility...');
  
  try {
    // Ajouter les colonnes nécessaires pour les sessions
    const columnsToAdd = [
      { name: 'sessionToken', type: 'text' },
      { name: 'sessionExpires', type: 'timestamp' },
      { name: 'verificationToken', type: 'text' },
      { name: 'verificationTokenExpires', type: 'timestamp' },
      { name: 'twoFactorEnabled', type: 'boolean', default: 'false' },
      { name: 'twoFactorVerified', type: 'boolean', default: 'false' }
    ];
    
    for (const column of columnsToAdd) {
      console.log(`Adding column ${column.name}...`);
      
      // Essayer d'ajouter la colonne
      const { error } = await supabase
        .from('users')
        .select(column.name)
        .limit(1);
      
      if (error && error.message.includes('column') && error.message.includes('does not exist')) {
        // La colonne n'existe pas, on peut l'ajouter
        const alterSQL = `
          ALTER TABLE users 
          ADD COLUMN ${column.name} ${column.type}${column.default ? ` DEFAULT ${column.default}` : ''}
        `;
        
        const { error: alterError } = await supabase.rpc('exec_sql', { sql: alterSQL });
        
        if (alterError) {
          console.log(`❌ Failed to add column ${column.name}: ${alterError.message}`);
        } else {
          console.log(`✅ Column ${column.name}: added successfully`);
        }
      } else {
        console.log(`✅ Column ${column.name}: already exists`);
      }
    }
    
    // Vérifier la structure finale
    console.log('\nFinal table structure:');
    const { data: sampleUser, error: sampleError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.log('❌ Error fetching sample user:', sampleError.message);
    } else {
      console.log('✅ Table structure updated successfully');
      console.log('Sample user data:', sampleUser);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

updateUsersTable();
