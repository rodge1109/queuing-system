const pool = require('../server/db');
async function checkRiders() {
  try {
    const res = await pool.query("SELECT id, name, vehicle_type FROM riders");
    console.table(res.rows);
  } finally {
    pool.end();
  }
}
checkRiders();
