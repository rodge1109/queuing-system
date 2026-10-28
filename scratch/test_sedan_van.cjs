const pool = require('../server/db');

async function testSedanVan() {
  try {
    // Let's test with simulated prices:
    // Route has:
    // 1) Standard Van: 4000
    // 2) Sedan (Economy): 2500

    // Test Van:
    const vanService = 'Regular Van';
    const vanCatRes = await pool.query('SELECT category FROM booking_services WHERE LOWER(name) = LOWER($1)', [vanService]);
    const vanCat = vanCatRes.rows[0]?.category || '';

    // Test Sedan:
    const sedanService = 'Sedan (Economy)';
    const sedanCatRes = await pool.query('SELECT category FROM booking_services WHERE LOWER(name) = LOWER($1)', [sedanService]);
    const sedanCat = sedanCatRes.rows[0]?.category || '';

    console.log('Van Service:', vanService, 'Category:', vanCat);
    console.log('Sedan Service:', sedanService, 'Category:', sedanCat);

    // Let's check how the SQL query matches if we add a temporary Sedan price to route 16
    await pool.query('BEGIN');

    // Insert Sedan price for route 16
    await pool.query(`
      INSERT INTO predefined_route_prices (route_id, service_type, price)
      VALUES (16, 'Sedan (Economy)', 2500.00)
    `);

    // Now query for Van
    const vanPriceQuery = await pool.query(`
      SELECT p.price, p.service_type, r.route_name
      FROM predefined_route_prices p
      JOIN predefined_routes r ON p.route_id = r.id
      WHERE p.route_id = 16 AND r.is_active = true
      AND (
        LOWER(p.service_type) = LOWER($1) 
        OR LOWER($1) LIKE '%' || LOWER(p.service_type) || '%' 
        OR LOWER(p.service_type) LIKE '%' || LOWER($1) || '%'
        OR LOWER(p.service_type) = LOWER($2)
        OR LOWER($2) LIKE '%' || LOWER(p.service_type) || '%'
        OR LOWER(p.service_type) LIKE '%' || LOWER($2) || '%'
        OR (LOWER($1) LIKE '%van%' AND LOWER(p.service_type) LIKE '%van%')
        OR (LOWER($2) LIKE '%van%' AND LOWER(p.service_type) LIKE '%van%')
      )
      LIMIT 1
    `, [vanService, vanCat]);

    // Now query for Sedan
    const sedanPriceQuery = await pool.query(`
      SELECT p.price, p.service_type, r.route_name
      FROM predefined_route_prices p
      JOIN predefined_routes r ON p.route_id = r.id
      WHERE p.route_id = 16 AND r.is_active = true
      AND (
        LOWER(p.service_type) = LOWER($1) 
        OR LOWER($1) LIKE '%' || LOWER(p.service_type) || '%' 
        OR LOWER(p.service_type) LIKE '%' || LOWER($1) || '%'
        OR LOWER(p.service_type) = LOWER($2)
        OR LOWER($2) LIKE '%' || LOWER(p.service_type) || '%'
        OR LOWER(p.service_type) LIKE '%' || LOWER($2) || '%'
        OR (LOWER($1) LIKE '%van%' AND LOWER(p.service_type) LIKE '%van%')
        OR (LOWER($2) LIKE '%van%' AND LOWER(p.service_type) LIKE '%van%')
      )
      LIMIT 1
    `, [sedanService, sedanCat]);

    console.log('\n--- RESULTS WITH BOTH CONFIGURED ---');
    console.log('VAN MATCH:', vanPriceQuery.rows[0]);
    console.log('SEDAN MATCH:', sedanPriceQuery.rows[0]);

    // Rollback so we don't alter test DB permanently
    await pool.query('ROLLBACK');
    console.log('\nTest transaction rolled back safely.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

testSedanVan();
