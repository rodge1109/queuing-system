const pool = require('./db.js');
async function check() {
  try {
    const clients = await pool.query("SELECT * FROM clients WHERE phone_number LIKE '%0912345679%' OR phone_number LIKE '%912345679%'");
    if (clients.rows.length > 0) console.log('clients:', clients.rows);
    
    const riders = await pool.query("SELECT * FROM riders WHERE phone LIKE '%912345679%'");
    if (riders.rows.length > 0) console.log('riders:', riders.rows);

    const staff = await pool.query("SELECT * FROM staff WHERE contact_info LIKE '%912345679%'");
    if (staff.rows.length > 0) console.log('staff:', staff.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
check();
