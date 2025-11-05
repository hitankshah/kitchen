import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_KEY not set in environment.');
  console.error('Please check your .env file in the backend folder.');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
