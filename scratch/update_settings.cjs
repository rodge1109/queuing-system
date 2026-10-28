const pool = require('../server/db');

async function updateDB() {
  try {
    await pool.query(`
      INSERT INTO clinic_settings (key, value, updated_at)
      VALUES ('clinic_email', 'kingstouristtransport_services@yahoo.com', CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE 
      SET value = 'kingstouristtransport_services@yahoo.com', updated_at = CURRENT_TIMESTAMP;
    `);

    const res = await pool.query("SELECT key, value FROM clinic_settings WHERE key IN ('clinic_name', 'clinic_phone', 'clinic_email')");
    console.log('Updated settings in DB:');
    console.table(res.rows);
  } catch (err) {
    console.error('Update error:', err);
  } finally {
    await pool.end();
  }
}

updateDB();
