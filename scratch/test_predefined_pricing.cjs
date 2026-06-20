const pool = require('../server/db');

async function checkPredefinedFares() {
  try {
    console.log("Checking predefined_routes table...");
    const routesRes = await pool.query("SELECT * FROM predefined_routes");
    console.log(`Found ${routesRes.rows.length} predefined routes:`);
    console.log(routesRes.rows);

    console.log("\nChecking predefined_route_prices table...");
    const pricesRes = await pool.query("SELECT * FROM predefined_route_prices");
    console.log(`Found ${pricesRes.rows.length} predefined route prices:`);
    console.log(pricesRes.rows);

  } catch (err) {
    console.error("Database query failed:", err.message);
    console.log("This might be because the server has not restarted/initialized the tables yet. Let's try to initialize them manually by running the initialization script...");
  } finally {
    pool.end();
  }
}

checkPredefinedFares();
