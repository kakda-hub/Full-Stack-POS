const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

// Simple .env parser to read connection details
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    // Ignore comments and empty lines
    if (line.trim().startsWith('#') || !line.includes('=')) return;
    
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    
    if (key.trim()) {
      process.env[key.trim()] = value;
    }
  });
}

async function runSeed() {
  if (process.env.DB_PASSWORD === '<PASSWORD>') {
    console.error('❌ Error: Please update <PASSWORD> in your .env file to your actual TiDB password before running this script.');
    process.exit(1);
  }

  console.log('Connecting to the database...');
  const resolvedDbName = process.env.DB_NAME || process.env.DB_DATABASE;
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Database: ${resolvedDbName}`);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER || process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      multipleStatements: true, // This allows running multiple queries from a file
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    const dbName = process.env.DB_NAME || process.env.DB_DATABASE;
    console.log('Connected! Creating database if not exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);

    console.log('Reading SQL file...');
    const sqlPath = path.join(__dirname, 'src', 'database', 'seeders', 'seed-demo-data.sql');
    
    if (!fs.existsSync(sqlPath)) {
        console.error(`❌ SQL file not found at: ${sqlPath}`);
        process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL script (this may take a moment)...');
    await connection.query(sqlContent);
    
    console.log('✅ Data seeding completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  }
}

runSeed();
