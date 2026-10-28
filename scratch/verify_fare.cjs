const pool = require('../server/db');

async function testFull() {
  try {
    const routeId = 16; // Liloan,Santander-Moalboal,Cebu
    const serviceType = 'Regular Van';

    let serviceCategory = '';
    const sRow = await pool.query('SELECT category FROM booking_services WHERE LOWER(name) = LOWER($1) LIMIT 1', [serviceType]);
    if (sRow.rows.length > 0) serviceCategory = sRow.rows[0].category || '';
    console.log(`Service: "${serviceType}", Category: "${serviceCategory}"`);

    const priceQuery = await pool.query(`
      SELECT p.price, r.route_name
      FROM predefined_route_prices p
      JOIN predefined_routes r ON p.route_id = r.id
      WHERE p.route_id = $1 AND r.is_active = true
      AND (
        LOWER(p.service_type) = LOWER($2) 
        OR LOWER($2) LIKE '%' || LOWER(p.service_type) || '%' 
        OR LOWER(p.service_type) LIKE '%' || LOWER($2) || '%'
        OR LOWER(p.service_type) = LOWER($3)
        OR LOWER($3) LIKE '%' || LOWER(p.service_type) || '%'
        OR LOWER(p.service_type) LIKE '%' || LOWER($3) || '%'
        OR (LOWER($2) LIKE '%van%' AND LOWER(p.service_type) LIKE '%van%')
        OR (LOWER($3) LIKE '%van%' AND LOWER(p.service_type) LIKE '%van%')
      )
      LIMIT 1
    `, [routeId, serviceType, serviceCategory]);

    console.log('Backend getCalculatedFare Query Match:');
    console.log(priceQuery.rows);

    if (priceQuery.rows.length > 0) {
      console.log(`SUCCESS! Rate resolved to: PHP ${parseFloat(priceQuery.rows[0].price).toLocaleString()}`);
    } else {
      console.log('FAILED! No rate found.');
    }

    // Now test GET /api/predefined-routes JSON structure that frontend receives
    const { rows } = await pool.query(`
      SELECT r.*, 
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', p.id, 'service_type', p.service_type, 'price', p.price))
            FROM predefined_route_prices p
            WHERE p.route_id = r.id
          ),
          '[]'::json
        ) as prices
      FROM predefined_routes r
      WHERE r.is_active = true
      ORDER BY r.route_name ASC
    `);

    const r16 = rows.find(r => r.id === 16);
    console.log('\nFrontend Route Object for Route 16:');
    console.log(JSON.stringify(r16, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

testFull();
