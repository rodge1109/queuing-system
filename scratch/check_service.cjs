const pool = require('../server/db');

async function checkService() {
  try {
    const res = await pool.query("SELECT * FROM booking_services WHERE name = 'Luxury Van'");
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkService();
