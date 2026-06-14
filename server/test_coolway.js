const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:root@localhost:5432/queuing_system' });
async function run() {
  try {
    const acc = await pool.query("SELECT id, company_name, balance FROM corporate_accounts WHERE company_name ILIKE '%coolway%'");
    console.log("Account:", acc.rows[0]);
    if(acc.rows[0]) {
      const id = acc.rows[0].id;
      const ledgers = await pool.query("SELECT * FROM corporate_ledgers WHERE account_id = $1", [id]);
      console.log("Ledger:", ledgers.rows);
      const invoices = await pool.query("SELECT * FROM corporate_invoices WHERE account_id = $1", [id]);
      console.log("Invoices:", invoices.rows);
      const payments = await pool.query("SELECT * FROM corporate_payments WHERE account_id = $1", [id]);
      console.log("Payments:", payments.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
