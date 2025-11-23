import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateSchema() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Supabase connections in some environments
    }
  });

  try {
    console.log('🔌 Connecting to remote database...');
    await client.connect();
    console.log('✅ Connected!');

    console.log('📂 Reading schema...');
    // Using the initial schema file
    const schemaPath = path.join(__dirname, '../supabase/migrations/20240101000000_initial_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
       console.error(`❌ Schema file not found at: ${schemaPath}`);
       process.exit(1);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚡ Executing schema migration...');
    
    // Simple execution of the SQL file
    // Note: For a real production app, you'd want a migration system (like Supabase CLI uses) 
    // to track which migrations have already run. This blindly applies the SQL.
    // Since the SQL uses "if not exists", it is somewhat idempotent, but be careful.
    await client.query(schemaSql);

    console.log('✅ Schema applied successfully!');

  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updateSchema();

