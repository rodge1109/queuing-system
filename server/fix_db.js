const pool = require('./db');

async function fixDb() {
  try {
    await pool.query('ALTER TABLE corporate_accounts RENAME COLUMN current_balance TO balance');
    console.log('Successfully renamed current_balance to balance');
  } catch (err) {
    console.error('Error renaming column:', err.message);
  }
  pool.end();
}

fixDb();
