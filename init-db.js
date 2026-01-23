// Database initialization script
// Run this script to create the database tables

require('dotenv').config();
const { initializeDatabase } = require('./src/lib/database');

async function main() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

main();