const pool = require('../server/db');

async function migrate() {
  try {
    console.log("Running predefined routes tables setup...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS predefined_routes (
        id SERIAL PRIMARY KEY,
        route_name VARCHAR(255) NOT NULL,
        pickup_name TEXT NOT NULL,
        pickup_lat DECIMAL(10, 8),
        pickup_lng DECIMAL(11, 8),
        destination_name TEXT NOT NULL,
        destination_lat DECIMAL(10, 8),
        destination_lng DECIMAL(11, 8),
        radius_meters INTEGER DEFAULT 500,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS predefined_route_prices (
        id SERIAL PRIMARY KEY,
        route_id INTEGER REFERENCES predefined_routes(id) ON DELETE CASCADE,
        service_type VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(route_id, service_type)
      )
    `);

    // Seed default route "Maya, Daanbantayan to Cebu City" if none exists
    const routeCheck = await pool.query('SELECT COUNT(*) FROM predefined_routes');
    if (parseInt(routeCheck.rows[0].count) === 0) {
      const routeResult = await pool.query(`
        INSERT INTO predefined_routes (route_name, pickup_name, pickup_lat, pickup_lng, destination_name, destination_lat, destination_lng)
        VALUES (
          'Maya, Daanbantayan to Cebu City',
          'Maya Port, Daanbantayan, Cebu',
          11.266100,
          124.061300,
          'Cebu City, Cebu',
          10.315700,
          123.885400
        )
        RETURNING id
      `);
      
      const routeId = routeResult.rows[0].id;
      
      // Seed prices for Van and Car
      await pool.query(`
        INSERT INTO predefined_route_prices (route_id, service_type, price)
        VALUES ($1, 'Luxury Van', 10000.00)
      `, [routeId]);

      await pool.query(`
        INSERT INTO predefined_route_prices (route_id, service_type, price)
        VALUES ($1, 'Luxury White Van', 10000.00)
      `, [routeId]);
      
      await pool.query(`
        INSERT INTO predefined_route_prices (route_id, service_type, price)
        VALUES ($1, 'Car', 4000.00)
      `, [routeId]);

      await pool.query(`
        INSERT INTO predefined_route_prices (route_id, service_type, price)
        VALUES ($1, 'Standard', 4000.00)
      `, [routeId]);

      console.log('Seeded predefined route: Maya, Daanbantayan to Cebu City');
    } else {
      console.log('Predefined routes already seeded.');
    }
    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    pool.end();
  }
}

migrate();
