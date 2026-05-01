const pool = require('../server/db');

async function updateBooking() {
  try {
    console.log('Updating booking #97...');
    const result = await pool.query(
      `UPDATE appointments 
       SET pickup_location = $1, 
           pickup_lat = $2, 
           pickup_lng = $3 
       WHERE id = $4 
       RETURNING id, full_name, pickup_location`,
      ['San Remigio, Cebu', 11.0583, 123.9312, 97]
    );

    if (result.rows.length > 0) {
      console.log('Successfully updated booking:', result.rows[0]);
    } else {
      console.log('Booking #97 not found.');
    }
  } catch (err) {
    console.error('Error updating booking:', err);
  } finally {
    pool.end();
  }
}

updateBooking();
