const pool = require('./db');

async function testBooking() {
  try {
    const amount = 20;
    const corporateAccountId = 1;

    // Simulate update balance
    await pool.query('UPDATE corporate_accounts SET balance = balance + $1 WHERE id = $2', [amount, corporateAccountId]);
    
    // Simulate insert
    const query = `
      INSERT INTO appointments (
        full_name, phone_number, email, service_type, preferred_date, 
        preferred_time, notes, cancel_token, specialist_id, agent_code, 
        pickup_location, destination_location,
        pickup_lat, pickup_lng, dest_lat, dest_lng,
        total_amount, corporate_account_id, payment_method
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const values = [
      'Test User', '123', 'test@test.com', 'Service', '2026-04-30', '10:00 AM', '', 'abc', null, null,
      null, null, null, null, null, null, amount, corporateAccountId, 'corporate'
    ];

    const res = await pool.query(query, values);
    console.log('Insert successful:', res.rows[0].id);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
}

testBooking();
