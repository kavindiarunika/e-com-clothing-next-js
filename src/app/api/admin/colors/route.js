import { createCrudHandlers } from "@/lib/adminCrud";

const handlers = createCrudHandlers({
	name: "Colors",
	resultKey: "colors",
	table: "colors",
	idField: "color_id",
	select: "SELECT color_id, name, hex_code, status, created_at FROM colors ORDER BY name",
	fields: [
		{ key: "name", column: "name", type: "string" },
		{ key: "hex_code", column: "hex_code", type: "string", nullable: true },
		{ key: "status", column: "status", type: "string" },
	],
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
