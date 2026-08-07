require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log('🔄 Running Razorpay migration...\n');

  try {
    // Check existing columns
    const [existingCols] = await conn.query('DESCRIBE orders');
    const colNames = existingCols.map(c => c.Field);

    // Add Razorpay payment columns
    if (!colNames.includes('razorpay_payment_id')) {
      console.log('Adding razorpay_payment_id column...');
      await conn.query(`ALTER TABLE orders ADD COLUMN razorpay_payment_id VARCHAR(100) DEFAULT NULL`);
      console.log('  ✓ razorpay_payment_id added');
    } else {
      console.log('  ℹ razorpay_payment_id already exists');
    }

    if (!colNames.includes('razorpay_order_id')) {
      console.log('Adding razorpay_order_id column...');
      await conn.query(`ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(100) DEFAULT NULL`);
      console.log('  ✓ razorpay_order_id added');
    } else {
      console.log('  ℹ razorpay_order_id already exists');
    }

    if (!colNames.includes('payment_status')) {
      console.log('Adding payment_status column...');
      await conn.query(`ALTER TABLE orders ADD COLUMN payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending'`);
      console.log('  ✓ payment_status added');
    } else {
      console.log('  ℹ payment_status already exists');
    }

    // Add indexes
    console.log('Adding indexes...');
    try {
      await conn.query('ALTER TABLE orders ADD INDEX idx_razorpay_payment (razorpay_payment_id)');
      console.log('  ✓ idx_razorpay_payment created');
    } catch(e) {
      if (e.message.includes('Duplicate')) {
        console.log('  ℹ idx_razorpay_payment already exists');
      } else throw e;
    }

    try {
      await conn.query('ALTER TABLE orders ADD INDEX idx_razorpay_order (razorpay_order_id)');
      console.log('  ✓ idx_razorpay_order created');
    } catch(e) {
      if (e.message.includes('Duplicate')) {
        console.log('  ℹ idx_razorpay_order already exists');
      } else throw e;
    }

    console.log('\n✅ Migration completed successfully!\n');

    // Show updated schema
    const [cols] = await conn.query('DESCRIBE orders');
    console.log('Updated orders table columns:');
    cols.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    await conn.end();
  }
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
