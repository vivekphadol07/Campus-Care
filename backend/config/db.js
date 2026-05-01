const mysql = require("mysql2");
require("dotenv").config();

// Create DB if not exists
const initConn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

initConn.query(
  `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
  (err) => {
    if (err) {
      console.error("Error creating database:", err.message);
    } else {
      console.log("Database checked/created successfully");
    }
    initConn.end();
  },
);

// Create Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

// Test DB connection (IMPORTANT)
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Database connected successfully");
    connection.release(); // return to pool
  }
});

module.exports = pool.promise();
