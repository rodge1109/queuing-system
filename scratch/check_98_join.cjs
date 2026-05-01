const pool = require('../server/db');

async function checkTrip98() {
  try {
    const query = `
      SELECT a.id, a.full_name, a.service_type, a.transport_status, s.category 
      FROM appointments a 
      JOIN booking_services s ON a.service_type = s.name 
      WHERE a.id = 98
    `;
    const result = await pool.query(query);
    console.log('Query result for #98:', result.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

checkTrip98();
