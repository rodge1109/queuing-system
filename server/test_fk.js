const pool = require('./db');

async function check() {
  try {
    const res = await pool.query(`
      SELECT
          tc.table_name, 
          kcu.column_name, 
          tc.constraint_name, 
          rc.delete_rule
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.referential_constraints AS rc
            ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'appointments';
    `);
    console.log("Appointments Foreign Keys:");
    console.table(res.rows);

    const res2 = await pool.query(`
      SELECT table_name, constraint_name, delete_rule 
      FROM information_schema.referential_constraints 
      WHERE constraint_name IN (
        SELECT constraint_name FROM information_schema.table_constraints 
        WHERE table_name IN ('corporate_ledgers', 'corporate_invoices', 'corporate_payments') AND constraint_type = 'FOREIGN KEY'
      )
    `);
    console.log("Corporate Tables Foreign Keys:");
    console.table(res2.rows);

  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

check();
