const pool = require('../server/db');

async function test() {
  try {
    const res = await pool.query('SELECT * FROM appointments ORDER BY id DESC LIMIT 5');
    console.log('Recent appointments:', JSON.stringify(res.rows, null, 2));
    
    // Also describe the columns of the table
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointments'
    `);
    console.log('Columns:');
    columns.rows.forEach(col => console.log(`  ${col.column_name}: ${col.data_type}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
