const pool = require('../server/db');

async function migrate() {
  try {
    console.log("Creating corporate_accounts table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS corporate_accounts (
        id SERIAL PRIMARY KEY,
        account_number VARCHAR(50) UNIQUE NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        credit_limit NUMERIC(10, 2) DEFAULT 0.00,
        current_balance NUMERIC(10, 2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert some mock corporate accounts for testing
    console.log("Inserting demo corporate accounts...");
    await pool.query(`
      INSERT INTO corporate_accounts (account_number, company_name, contact_person, credit_limit)
      VALUES 
        ('CORP-1001', 'Acme Logistics', 'John Doe', 50000.00),
        ('CORP-2002', 'Global Tech Solutions', 'Jane Smith', 100000.00),
        ('CORP-3003', 'City Hospital', 'Dr. Adams', 75000.00)
      ON CONFLICT (account_number) DO NOTHING;
    `);

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    pool.end();
  }
}

migrate();
