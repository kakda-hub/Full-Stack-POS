const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Simple .env parser to read connection details (mirrors run-sql-seed.js)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.includes('=')) return;
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (key.trim()) {
      process.env[key.trim()] = value;
    }
  });
}

async function main() {
  const port = parseInt(process.env.DB_PORT, 10);
  const user = process.env.DB_USER || process.env.DB_USERNAME;
  const database = process.env.DB_NAME || process.env.DB_DATABASE;
  if (!process.env.DB_HOST || !port || !user || !process.env.DB_PASSWORD || !database) {
    console.error('❌ Error: Missing database environment variables. Copy pos-backend/.env.example to .env and fill in your real values before running this script.');
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port,
    user,
    password: process.env.DB_PASSWORD,
    database,
    // SSL is enabled only when DB_SSL=true (TiDB Cloud production).
    ssl: String(process.env.DB_SSL || '').trim() === 'true' ? { rejectUnauthorized: true } : false
  });

  // Check current migration records
  const [rows] = await conn.execute('SELECT * FROM migrations');
  console.log('Current migrations:', JSON.stringify(rows, null, 2));

  // Delete the InitialSchema migration so it re-runs
  await conn.execute("DELETE FROM migrations WHERE name LIKE '%InitialSchema%'");
  console.log('Migration record deleted');

  const [rows2] = await conn.execute('SELECT * FROM migrations');
  console.log('Remaining migrations:', JSON.stringify(rows2, null, 2));

  await conn.end();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
