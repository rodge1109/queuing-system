const pool = require('./db');

async function query() {
  try {
    console.log("=== QUEUE STAFF ===");
    const staff = await pool.query("SELECT id, username, name, role FROM queue_staff");
    console.log(staff.rows);

    console.log("=== CLINIC SETTINGS ===");
    const settings = await pool.query("SELECT * FROM clinic_settings");
    console.log(settings.rows);

    console.log("=== RIDERS ===");
    const riders = await pool.query("SELECT id, name, phone, email, is_active FROM riders");
    console.log(riders.rows);

    console.log("=== CLIENTS ===");
    const clients = await pool.query("SELECT id, name, phone, email FROM clients LIMIT 5");
    console.log(clients.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

query();
