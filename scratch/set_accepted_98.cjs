const pool = require('../server/db');

async function updateStatus() {
  try {
    console.log('Setting status of booking #98 to accepted...');
    await pool.query(
      `UPDATE appointments 
       SET transport_status = 'accepted' 
       WHERE id = 98`
    );
    console.log('Successfully updated status.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

updateStatus();
