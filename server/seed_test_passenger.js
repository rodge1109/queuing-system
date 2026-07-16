const pool = require('./db.js');

async function seed() {
  try {
    await pool.query(
      `INSERT INTO clients (full_name, phone_number, email, password) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (phone_number) 
       DO UPDATE SET password = EXCLUDED.password`,
      ['Test Passenger', '09123456789', 'passenger@test.com', 'passenger123']
    );
    console.log("Passenger forced updated/seeded successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
seed();
