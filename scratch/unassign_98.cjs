const pool = require('../server/db');

async function unassignRider() {
  try {
    console.log('Unassigning rider from booking #98 and setting status to searching...');
    await pool.query(
      `UPDATE appointments 
       SET rider_id = NULL, 
           transport_status = 'searching' 
       WHERE id = 98`
    );
    console.log('Successfully unassigned rider.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

unassignRider();
