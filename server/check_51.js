const pool = require('./db');
pool.query('SELECT id, full_name, status, transport_status, service_type FROM appointments WHERE id = 51')
  .then(res => {
    console.log(JSON.stringify(res.rows[0], null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
