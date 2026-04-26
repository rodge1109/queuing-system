const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'transport_migration.sql'), 'utf8');
    console.log('Running transport migration...');
    await pool.query(sql);
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
