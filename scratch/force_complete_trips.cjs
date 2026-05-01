const pool = require('../server/db');

async function fixTrips() {
  try {
    console.log('Checking bookings 73 and 74...');
    const { rows } = await pool.query('SELECT id, status, transport_status FROM appointments WHERE id IN (73, 74)');
    console.log('Current state:', rows);

    console.log('Updating bookings 73 and 74 to completed...');
    const result = await pool.query(
      "UPDATE appointments SET status = 'completed', transport_status = 'completed', updated_at = NOW() WHERE id IN (73, 74) RETURNING *"
    );
    console.log('Update successful:', result.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixTrips();
