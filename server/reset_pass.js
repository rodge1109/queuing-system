const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const pool = new Pool({ connectionString: 'postgresql://postgres:Ch3l3l3t110977@localhost:5432/clinic_booking' });

async function reset() {
  const hash = await bcrypt.hash('teller123', 10);
  await pool.query('UPDATE queue_staff SET password = $1 WHERE username = $2', [hash, 'teller1']);
  console.log('Password for teller1 reset to: teller123');
  process.exit(0);
}
reset().catch(e => { console.error(e); process.exit(1); });
