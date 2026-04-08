const pool = require('./connection');

async function migrate() {
  try {
    console.log('Running database migrations...');
    
    // 1. Alter Users Table
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN year VARCHAR(50),
        ADD COLUMN section VARCHAR(50),
        ADD COLUMN course VARCHAR(100),
        ADD COLUMN profile_pic_url VARCHAR(255)
      `);
      console.log('Added profile fields to users table.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Columns already exist.');
      } else {
        throw e;
      }
    }

    // 2. Drop and Recreate Resources Table
    await pool.query('DROP TABLE IF EXISTS resources');
    
    await pool.query(`
      CREATE TABLE resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Recreated resources table successfully.');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
