const pool = require('../server/db');
async function checkTable() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'appointments'");
    console.table(res.rows);
  } finally {
    pool.end();
  }
}
checkTable();
