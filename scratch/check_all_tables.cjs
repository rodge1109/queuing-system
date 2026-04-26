const pool = require('../server/db');
async function checkTables() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.table(res.rows);
  } finally {
    pool.end();
  }
}
checkTables();
