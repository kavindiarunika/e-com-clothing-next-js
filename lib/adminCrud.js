import { query } from "@/lib/db";

export const ADMIN_TABLES = {
  products: "products",
  categories: "categories",
  subcategories: "subcategories",
  sizes: "sizes",
  colors: "colors",
  orders: "orders",
  customers: "users",
  inventory: "inventory",
  coupons: "coupons",
  banners: "banners",
  reviews: "reviews",
  returns: "returns",
  payments: "payments",
  shipments: "shipments",
  featured_products: "featured_products",
};

export function getTable(resource) {
  return ADMIN_TABLES[resource] || null;
}

export async function getColumns(table) {
  const rows = await query(
    `
    SELECT
      COLUMN_NAME,
      DATA_TYPE,
      IS_NULLABLE,
      COLUMN_KEY,
      EXTRA,
      COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    ORDER BY ORDINAL_POSITION
    `,
    [table]
  );

  return rows;
}

export function quoteIdentifier(identifier) {
  return `\`${String(identifier).replace(/`/g, "``")}\``;
}

export async function getPrimaryKey(table) {
  const rows = await query(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_KEY = 'PRI'
    ORDER BY ORDINAL_POSITION
    LIMIT 1
    `,
    [table]
  );

  return rows.length ? rows[0].COLUMN_NAME : null;
}

export function cleanBody(body, columns) {
  const validColumns = new Set(columns.map((column) => column.COLUMN_NAME));

  const cleaned = {};

  for (const [key, value] of Object.entries(body)) {
    if (validColumns.has(key)) {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export async function getAll(table) {
  const rows = await query(
    `SELECT * FROM ${quoteIdentifier(table)} ORDER BY 1 DESC`
  );

  return rows;
}

export async function getOne(table, id) {
  const primaryKey = await getPrimaryKey(table);

  if (!primaryKey) {
    throw new Error(`No primary key found for ${table}`);
  }

  const rows = await query(
    `
    SELECT *
    FROM ${quoteIdentifier(table)}
    WHERE ${quoteIdentifier(primaryKey)} = ?
    LIMIT 1
    `,
    [id]
  );

  return rows.length ? rows[0] : null;
}

export async function insertOne(table, data) {
  const columns = await getColumns(table);

  const cleaned = cleanBody(data, columns);

  const keys = Object.keys(cleaned);

  if (!keys.length) {
    throw new Error("No valid fields supplied");
  }

  const values = keys.map((key) => cleaned[key]);

  const columnSQL = keys.map(quoteIdentifier).join(", ");

  const placeholders = keys.map(() => "?").join(", ");

  const result = await query(
    `
    INSERT INTO ${quoteIdentifier(table)}
    (${columnSQL})
    VALUES (${placeholders})
    `,
    values
  );

  return result;
}

export async function updateOne(table, id, data) {
  const primaryKey = await getPrimaryKey(table);

  if (!primaryKey) {
    throw new Error(`No primary key found for ${table}`);
  }

  const columns = await getColumns(table);

  const cleaned = cleanBody(data, columns);

  delete cleaned[primaryKey];

  const keys = Object.keys(cleaned);

  if (!keys.length) {
    throw new Error("No valid fields supplied");
  }

  const values = keys.map((key) => cleaned[key]);

  const setSQL = keys
    .map((key) => `${quoteIdentifier(key)} = ?`)
    .join(", ");

  values.push(id);

  const result = await query(
    `
    UPDATE ${quoteIdentifier(table)}
    SET ${setSQL}
    WHERE ${quoteIdentifier(primaryKey)} = ?
    `,
    values
  );

  return result;
}

export async function deleteOne(table, id) {
  const primaryKey = await getPrimaryKey(table);

  if (!primaryKey) {
    throw new Error(`No primary key found for ${table}`);
  }

  return query(
    `
    DELETE FROM ${quoteIdentifier(table)}
    WHERE ${quoteIdentifier(primaryKey)} = ?
    `,
    [id]
  );
}