const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});


const oldQuery = pool.query.bind(pool);


pool.query = (sql, values, callback) => {
  if (typeof values === "function") {
    callback = values;
    values = [];
  }

  if (typeof callback === "function") {
    oldQuery(sql, values)
      .then(([result]) => {
        callback(null, result);
      })
      .catch((err) => {
        callback(err);
      });
    return;
  }

  return oldQuery(sql, values);
};

module.exports = pool;
