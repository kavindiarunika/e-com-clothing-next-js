import { createCrudHandlers } from "@/lib/adminCrud";

const handlers = createCrudHandlers({
	name: "Sizes",
	resultKey: "sizes",
	table: "sizes",
	idField: "size_id",
	select: "SELECT size_id, name, status, created_at FROM sizes ORDER BY name",
	fields: [
		{ key: "name", column: "name", type: "string" },
		{ key: "status", column: "status", type: "string" },
	],
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
