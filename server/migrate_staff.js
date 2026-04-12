const pool = require('./db');
const bcrypt = require('bcryptjs');

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS queue_staff (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'teller',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Add default teller
    const hash = await bcrypt.hash('teller123', 10);
    await pool.query(
      `INSERT INTO queue_staff (username, password, name) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      ['teller1', hash, 'Default Teller']
    );
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
