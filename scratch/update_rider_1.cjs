const pool = require('../server/db');

async function updateRider() {
  try {
    console.log('Updating Demo Rider (#1) to San Remigio coordinates...');
    await pool.query(
      `UPDATE riders 
       SET current_lat = $1, 
           current_lng = $2 
       WHERE id = 1`,
      [11.0583, 123.9312]
    );
    console.log('Successfully updated rider coordinates.');
  } catch (err) {
    console.error('Error updating rider:', err);
  } finally {
    pool.end();
  }
}

updateRider();
