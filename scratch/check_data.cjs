const pool = require('../server/db');
async function checkData() {
  try {
    const res = await pool.query("SELECT * FROM corporate_accounts ORDER BY id DESC LIMIT 5");
    console.table(res.rows);
  } finally {
    pool.end();
  }
}
checkData();
