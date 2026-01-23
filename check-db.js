const { Pool } = require('pg');

// Create database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'intelligent_sales_marketing',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkStores() {
  try {
    console.log('Checking stores in database...');
    
    // Query all stores regardless of status
    const result = await pool.query('SELECT * FROM stores');
    
    if (result.rows.length === 0) {
      console.log('No stores found in database');
    } else {
      console.log(`Found ${result.rows.length} store(s):`);
      result.rows.forEach((store, index) => {
        console.log(`\nStore ${index + 1}:`);
        console.log(`  Shop Domain: ${store.shop_domain}`);
        console.log(`  Shop Name: ${store.name}`);
        console.log(`  Status: ${store.status}`);
        console.log(`  Created At: ${store.created_at}`);
        console.log(`  Updated At: ${store.updated_at}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await pool.end();
  }
}

checkStores();