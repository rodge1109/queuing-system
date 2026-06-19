const pool = require('../server/db');

async function testStats() {
  try {
    console.log("Testing PostgreSQL stats queries...");

    // 1. Total Receivables
    const recRes = await pool.query('SELECT COALESCE(SUM(balance), 0) as total FROM corporate_accounts');
    console.log("Total Receivables:", recRes.rows[0].total);

    // 2. Receivables last month
    const prevRecRes = await pool.query(`
      SELECT COALESCE(SUM(debit - credit), 0) as total 
      FROM corporate_ledgers 
      WHERE date < DATE_TRUNC('month', CURRENT_DATE)
    `);
    console.log("Previous Month Receivables:", prevRecRes.rows[0].total);

    // 3. Overdue Amount
    const overdueRes = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total,
             COUNT(DISTINCT account_id) as client_count
      FROM corporate_invoices
      WHERE status = 'pending' AND date < CURRENT_DATE - INTERVAL '30 days'
    `);
    console.log("Overdue Amount & Clients:", overdueRes.rows[0]);

    // 4. Collected MTD
    const collectedRes = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total,
             COUNT(*) as count
      FROM corporate_payments
      WHERE payment_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND payment_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    `);
    console.log("Collected MTD:", collectedRes.rows[0]);

    // 5. Avg Days
    const avgCollectionRes = await pool.query(`
      SELECT COALESCE(ROUND(AVG(p.payment_date - i.date)), 0) as avg_days
      FROM corporate_payments p
      JOIN corporate_invoices i ON p.invoice_id = i.id
      WHERE i.status = 'paid'
    `);
    console.log("Avg Collection Days:", avgCollectionRes.rows[0].avg_days);

    // 6. Brackets
    const bracketsRes = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '30 days' THEN amount ELSE 0 END), 0) as b1,
        COALESCE(SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '60 days' AND date < CURRENT_DATE - INTERVAL '30 days' THEN amount ELSE 0 END), 0) as b2,
        COALESCE(SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '90 days' AND date < CURRENT_DATE - INTERVAL '60 days' THEN amount ELSE 0 END), 0) as b3,
        COALESCE(SUM(CASE WHEN date < CURRENT_DATE - INTERVAL '90 days' THEN amount ELSE 0 END), 0) as b4
      FROM corporate_invoices
      WHERE status = 'pending'
    `);
    console.log("Brackets:", bracketsRes.rows[0]);

    console.log("All queries executed successfully without errors.");
  } catch (err) {
    console.error("Query Error:", err);
  } finally {
    pool.end();
  }
}

testStats();
