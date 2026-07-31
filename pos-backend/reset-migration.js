const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER || process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: true }
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
