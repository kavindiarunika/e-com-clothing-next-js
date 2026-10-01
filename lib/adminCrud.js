import { query } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

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

export function createCrudHandlers({
  name,
  resultKey,
  table,
  idField,
  select,
  fields,
}) {
  const fieldMap = new Map(fields.map((field) => [field.key, field]));

  function getId(body) {
    return body[idField] ?? body.id;
  }

  function cleanConfiguredBody(body) {
    const cleaned = {};

    for (const [key, field] of fieldMap) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        cleaned[field.column] = body[key] === "" && field.nullable ? null : body[key];
      }
    }

    return cleaned;
  }

  async function requireAdmin() {
    return getAdmin();
  }

  async function GET() {
    try {
      if (!(await requireAdmin())) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }

      const rows = await query(select);
      return Response.json({ success: true, [resultKey]: rows });
    } catch (error) {
      return Response.json(
        { success: false, message: `Failed to load ${name.toLowerCase()}`, error: error.message },
        { status: 500 }
      );
    }
  }

  async function POST(request) {
    try {
      if (!(await requireAdmin())) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }

      const data = cleanConfiguredBody(await request.json());
      const columns = Object.keys(data);

      if (!columns.length) {
        return Response.json({ success: false, message: "No valid fields supplied" }, { status: 400 });
      }

      const result = await query(
        `INSERT INTO ${quoteIdentifier(table)} (${columns.map(quoteIdentifier).join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
        columns.map((column) => data[column])
      );

      return Response.json(
        { success: true, message: `${name} created successfully`, [idField]: result.insertId },
        { status: 201 }
      );
    } catch (error) {
      return Response.json(
        { success: false, message: `Failed to create ${name.toLowerCase()}`, error: error.message },
        { status: 500 }
      );
    }
  }

  async function PUT(request) {
    try {
      if (!(await requireAdmin())) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }

      const body = await request.json();
      const id = getId(body);
      const data = cleanConfiguredBody(body);
      const columns = Object.keys(data);

      if (id === undefined || id === null || !columns.length) {
        return Response.json({ success: false, message: "A valid ID and fields are required" }, { status: 400 });
      }

      await query(
        `UPDATE ${quoteIdentifier(table)} SET ${columns.map((column) => `${quoteIdentifier(column)} = ?`).join(", ")} WHERE ${quoteIdentifier(idField)} = ?`,
        [...columns.map((column) => data[column]), id]
      );

      return Response.json({ success: true, message: `${name} updated successfully` });
    } catch (error) {
      return Response.json(
        { success: false, message: `Failed to update ${name.toLowerCase()}`, error: error.message },
        { status: 500 }
      );
    }
  }

  async function DELETE(request) {
    try {
      if (!(await requireAdmin())) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }

      const id = getId(await request.json());

      if (id === undefined || id === null) {
        return Response.json({ success: false, message: "A valid ID is required" }, { status: 400 });
      }

      await deleteOne(table, id);
      return Response.json({ success: true, message: `${name} deleted successfully` });
    } catch (error) {
      return Response.json(
        { success: false, message: `Failed to delete ${name.toLowerCase()}`, error: error.message },
        { status: 500 }
      );
    }
  }

  return { GET, POST, PUT, DELETE };
}