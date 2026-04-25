const pool = require('../server/db');

async function test() {
  try {
    const name = 'Luxury Van';
    const duration = '30m';
    const price = 'PHP 3,500';
    const icon = '🚐';
    const category = 'Transport';
    const base_fare = 3500;
    const per_km_rate = 10;

    const { rows } = await pool.query(
      'INSERT INTO booking_services (name, duration, price, icon, category, base_fare, per_km_rate) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, duration, price, icon, category, base_fare, per_km_rate]
    );
    console.log('Success:', rows[0]);
  } catch (e) {
    console.error('FAILED TO INSERT SERVICE:', e.message);
    if (e.detail) console.error('Detail:', e.detail);
  } finally {
    process.exit();
  }
}

test();
