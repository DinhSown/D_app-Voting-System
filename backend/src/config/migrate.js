const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true
  });

  const dbName = process.env.DB_NAME || "dapp_voting";

  console.log("🚀 Starting database migration...");

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${dbName}\``);

  // ADMINS
  await conn.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('super_admin','admin') DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  // VOTINGS
  await conn.query(`
    CREATE TABLE IF NOT EXISTS votings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      contract_address VARCHAR(42),
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      status ENUM('draft','active','ended','cancelled') DEFAULT 'draft',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  // CANDIDATES
  await conn.query(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      voting_id INT NOT NULL,
      candidate_name VARCHAR(255) NOT NULL,
      candidate_description TEXT,
      image_url VARCHAR(500),
      blockchain_candidate_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (voting_id) REFERENCES votings(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // VOTE TRANSACTIONS
  await conn.query(`
    CREATE TABLE IF NOT EXISTS vote_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      voting_id INT NOT NULL,
      wallet_address VARCHAR(42) NOT NULL,
      candidate_blockchain_id INT NOT NULL,
      tx_hash VARCHAR(66),
      block_number BIGINT,
      status ENUM('pending','confirmed','failed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (voting_id) REFERENCES votings(id) ON DELETE CASCADE,
      UNIQUE KEY unique_wallet_voting (voting_id, wallet_address)
    ) ENGINE=InnoDB
  `);

  // SYNC LOGS
  await conn.query(`
    CREATE TABLE IF NOT EXISTS sync_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      contract_address VARCHAR(42) NOT NULL,
      last_synced_block BIGINT DEFAULT 0,
      status ENUM('success','error','running') DEFAULT 'success',
      message TEXT,
      synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  // Seed default admin
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@votingdapp.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

  const [existing] = await conn.query("SELECT id FROM admins WHERE username = ?", [adminUsername]);
  if (existing.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await conn.query(
      "INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, 'super_admin')",
      [adminUsername, adminEmail, hash]
    );
    console.log(`✅ Default admin created: ${adminEmail} / ${adminPassword}`);
  }

  await conn.end();
  console.log("✅ Migration complete!");
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
