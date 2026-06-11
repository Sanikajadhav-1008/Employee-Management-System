import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "root1008",
  database: process.env.DB_NAME || "employee_ms",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Check Database Connection
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database Connected Successfully!");
    connection.release();
  } catch (error) {
    console.error("❌ Database Connection Failed:");
    console.error(error.message);
  }
}

checkConnection();

export default pool;