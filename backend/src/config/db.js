const mysql = require("mysql2/promise");
require("dotenv").config();

function getPoolConfig() {
  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (dbUrl) {
    const url = require("url");
    const params = url.parse(dbUrl);
    const auth = params.auth ? params.auth.split(":") : [];
    const config = {
      host: params.hostname,
      port: params.port ? parseInt(params.port, 10) : 3306,
      user: auth[0],
      password: auth[1],
      database: params.pathname ? params.pathname.replace(/^\//, "") : undefined,
    };
    if (process.env.DB_SSL === "true") {
      config.ssl = { rejectUnauthorized: false };
    }
    return config;
  }

  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  };
  if (process.env.DB_SSL === "true") {
    config.ssl = { rejectUnauthorized: false };
  }
  return config;
}

const pool = mysql.createPool({
  ...getPoolConfig(),
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
