import { supabase } from '../src/lib/supabase';

if (!supabase) {
  console.error('Supabase client is not initialized');
  process.exit(1);
}

console.log('Environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...');

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...');
  
  try {
    // Test simple query
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      process.exit(1);
    }

    console.log('✅ Supabase connected successfully');
    console.log('Sample user data:', data);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

testSupabaseConnection();