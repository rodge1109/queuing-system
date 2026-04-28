const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runMigration() {
  try {
    const schemaPath = path.join(__dirname, 'corporate_billing_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running corporate billing migration...');
    await pool.query(sql);
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    pool.end();
  }
}

runMigration();
