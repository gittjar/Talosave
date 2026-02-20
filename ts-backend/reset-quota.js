const sql = require('mssql');
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

async function resetQuota() {
  try {
    console.log('🔌 Connecting to database...');
    await sql.connect(sqlConfig);
    console.log('✅ Connected to database');
    
    // Check current values
    console.log('\n📊 Current values:');
    const currentResult = await sql.query`
      SELECT userid, storageUsed, propertyImagesUsed, renovationImagesUsed 
      FROM TS_PropertyUsers 
      WHERE userid = 2
    `;
    console.table(currentResult.recordset);
    
    // Reset to zero
    console.log('\n🔄 Resetting quota values to 0...');
    const result = await sql.query`
      UPDATE TS_PropertyUsers 
      SET storageUsed = 0, 
          propertyImagesUsed = 0, 
          renovationImagesUsed = 0
      WHERE userid = 2
    `;
    console.log(`✅ Updated ${result.rowsAffected[0]} row(s)`);
    
    // Check new values
    console.log('\n📊 New values:');
    const newResult = await sql.query`
      SELECT userid, storageUsed, propertyImagesUsed, renovationImagesUsed 
      FROM TS_PropertyUsers 
      WHERE userid = 2
    `;
    console.table(newResult.recordset);
    
    console.log('\n✅ Quota reset complete! Refresh your browser to see the correct values.');
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.close();
    process.exit(0);
  }
}

resetQuota();
