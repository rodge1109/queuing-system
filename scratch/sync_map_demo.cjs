const pool = require('../server/db');

async function syncDemoData() {
  try {
    console.log('Syncing Demo Data for #97 and #98...');
    
    // 1. Move Demo Rider (#1) slightly away from San Remigio to show #97 route
    // San Remigio is ~11.0583, 123.9312. Moving rider to a nearby barangay.
    await pool.query(
      "UPDATE riders SET current_lat = 11.0500, current_lng = 124.0000 WHERE id = 1" // Bogo Center
    );

    // 2. Reassign Rider #2 to Booking #98 and move Rider #2 to Bogo
    // Medellin is ~11.1342, 123.9631.
    await pool.query(
      "UPDATE riders SET current_lat = 11.0450, current_lng = 124.0120 WHERE id = 4" // Rider 2 at Bogo Proper
    );
    await pool.query(
      "UPDATE appointments SET rider_id = 4, transport_status = 'accepted' WHERE id = 98"
    );

    console.log('Successfully synced demo positions and assignments.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

syncDemoData();
