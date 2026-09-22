import { createCrudHandlers } from "@/lib/adminCrud";

const handlers = createCrudHandlers({
	name: "Payments",
	resultKey: "payments",
	table: "payments",
	idField: "payment_id",
	select: `
		SELECT p.payment_id, p.order_id, p.payment_method, p.transaction_id,
					 p.amount, p.payment_status, p.paid_at, p.created_at
		FROM payments p ORDER BY p.payment_id DESC
	`,
	fields: [
		{ key: "order_id", column: "order_id", type: "number" },
		{ key: "payment_method", column: "payment_method", type: "string" },
		{ key: "transaction_id", column: "transaction_id", type: "string", nullable: true },
		{ key: "amount", column: "amount", type: "number" },
		{ key: "payment_status", column: "payment_status", type: "string" },
	],
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
