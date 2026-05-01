const pool = require('../server/db');

async function updateBooking() {
  try {
    console.log('Updating booking #98 coordinates...');
    const result = await pool.query(
      `UPDATE appointments 
       SET pickup_lat = $1, 
           pickup_lng = $2,
           dest_lat = $3,
           dest_lng = $4
       WHERE id = $5 
       RETURNING id, full_name, pickup_location, pickup_lat`,
      [11.1342, 123.9631, 11.0500, 124.0000, 98]
    );

    if (result.rows.length > 0) {
      console.log('Successfully updated booking #98:', result.rows[0]);
    } else {
      console.log('Booking #98 not found.');
    }
  } catch (err) {
    console.error('Error updating booking:', err);
  } finally {
    pool.end();
  }
}

updateBooking();
