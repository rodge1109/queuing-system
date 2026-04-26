const pool = require('../server/db');

async function checkBooking() {
  try {
    const res = await pool.query('SELECT * FROM appointments WHERE id = $1', [63]);
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkBooking();
