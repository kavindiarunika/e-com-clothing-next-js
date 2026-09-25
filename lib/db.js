import mysql from "mysql2/promise";

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "velora",

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,

      charset: "utf8mb4",
    });
  }

  return pool;
}

export async function query(sql, params = []) {
  const db = getPool();

  const [rows] = await db.execute(sql, params);

  return rows;
}

const db = {
  query(...args) {
    return getPool().query(...args);
  },
  execute(...args) {
    return getPool().execute(...args);
  },
};

export default db;