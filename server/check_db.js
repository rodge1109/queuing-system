const pool = require('./db');

async function check() {
  try {
    const res = await pool.query("SELECT id, balance, credit_limit FROM corporate_accounts WHERE account_number = '10001'");
    console.log(res.rows);
  } catch (err) {
    console.error(err.message);
  }
  pool.end();
}

check();
