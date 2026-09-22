import { createCrudHandlers } from "@/lib/adminCrud";

const handlers = createCrudHandlers({
	name: "Customers",
	resultKey: "customers",
	table: "users",
	idField: "user_id",
	select: `
		SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone, u.status,
					 COUNT(o.order_id) AS order_count
		FROM users u LEFT JOIN orders o ON o.user_id = u.user_id
		WHERE u.role = 'customer'
		GROUP BY u.user_id ORDER BY u.user_id DESC
	`,
	fields: [
		{ key: "first_name", column: "first_name", type: "string" },
		{ key: "last_name", column: "last_name", type: "string", nullable: true },
		{ key: "email", column: "email", type: "string" },
		{ key: "phone", column: "phone", type: "string", nullable: true },
		{ key: "status", column: "status", type: "string" },
	],
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
