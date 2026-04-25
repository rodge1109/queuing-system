const pool = require('../server/db');

async function check() {
  try {
    const res = await pool.query('SELECT * FROM riders');
    console.log('--- RIDERS ---');
    console.table(res.rows);
    console.log('--------------');
  } catch (e) {
    console.error('Error checking riders:', e.message);
  } finally {
    process.exit();
  }
}

check();
