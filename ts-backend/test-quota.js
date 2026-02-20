const sql = require('mssql');
const { getAllStorageUsage } = require('./middleware/storageQuota');
require('dotenv').config();

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function testQuota() {
  try {
    console.log('🔌 Connecting to database...');
    await sql.connect(sqlConfig);
    console.log('✅ Connected to database');
    
    const userId = 2;
    console.log(`\n📊 Testing getAllStorageUsage for user ${userId}:`);
    
    const allUsage = await getAllStorageUsage(userId);
    
    console.log('\n📦 Raw data from getAllStorageUsage:');
    console.log(JSON.stringify(allUsage, null, 2));
    
    console.log('\n🔢 Calculations:');
    console.log('Documents used (bytes):', allUsage.documents.used);
    console.log('Documents used (MB):', allUsage.documents.used / (1024 * 1024));
    
    console.log('\nProperty images used (bytes):', allUsage.propertyImages.used);
    console.log('Property images used (MB):', allUsage.propertyImages.used / (1024 * 1024));
    
    console.log('\nRenovation images used (bytes):', allUsage.renovationImages.used);
    console.log('Renovation images used (MB):', allUsage.renovationImages.used / (1024 * 1024));
    
    console.log('\nTotal used (bytes):', allUsage.total.used);
    console.log('Total used (MB):', allUsage.total.used / (1024 * 1024));
    
    console.log('\nTotal limit (bytes):', allUsage.total.limit);
    console.log('Total limit (MB):', allUsage.total.limit / (1024 * 1024));
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.close();
    process.exit(0);
  }
}

testQuota();
