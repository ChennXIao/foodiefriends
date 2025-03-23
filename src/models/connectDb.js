const mysql = require('mysql2');
require('dotenv').config();
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT;

const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: 'foodiefriend',
  port: DB_PORT,
  insecureAuth: true,
  connectionLimit: 10,
});

module.exports = pool;
