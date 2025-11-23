import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
  // Check for Management API token (Personal Access Token)
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectUrl = process.env.VITE_SUPABASE_URL;

  if (!projectUrl) {
    console.error('❌ VITE_SUPABASE_URL is missing in .env.local');
    process.exit(1);
  }

  // Extract Project Ref from URL (e.g., https://abcdef.supabase.co -> abcdef)
  const projectRefMatch = projectUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectRef = projectRefMatch ? projectRefMatch[1] : null;

  if (!projectRef) {
    console.error('❌ Could not extract Project Ref from VITE_SUPABASE_URL');
    process.exit(1);
  }

  if (!accessToken) {
    console.error('❌ SUPABASE_ACCESS_TOKEN is missing.');
    console.error('   To use the HTTP API for schema migration, you need a Personal Access Token.');
    console.error('   1. Go to https://supabase.com/dashboard/account/tokens');
    console.error('   2. Generate a new token');
    console.error('   3. Run: SUPABASE_ACCESS_TOKEN=your_token npx tsx scripts/init-db.ts');
    process.exit(1);
  }

  console.log(`🔌 Using Supabase Management API for project: ${projectRef}`);

  try {
    console.log('📂 Reading schema...');
    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚡ Executing schema via Management API...');

    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query: schemaSql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log('✅ Schema executed successfully!');

    // Verification (re-using the SQL endpoint to check tables)
    console.log('🔍 Verifying tables...');
    const verifyResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ 
        query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" 
      })
    });

    if (!verifyResponse.ok) {
      throw new Error('Verification request failed');
    }

    const verifyResult = await verifyResponse.json();
    // Result format: { result: [{ table_name: '...' }, ...] }
    // Note: Management API might return different structure depending on version, usually it's array of objects in 'result' or similar.
    // The SQL endpoint typically returns raw rows.
    
    // Let's assume standard array of rows or specific result structure
    const rows = Array.isArray(verifyResult) ? verifyResult : (verifyResult as any).result || [];
    const tableNames = rows.map((r: any) => r.table_name);
    
    console.log('Found tables:', tableNames);

    if (tableNames.includes('recipes') && tableNames.includes('meal_plans')) {
      console.log('✅ Verification successful: Tables created.');
    } else {
      console.error('❌ Verification failed: Missing tables.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

init();
