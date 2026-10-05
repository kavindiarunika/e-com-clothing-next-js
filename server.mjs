import { createServer } from "node:http";
import nextEnv from "@next/env";
import next from "next";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { registerRealtimeServer } from "./lib/realtime.mjs";

const { loadEnvConfig } = nextEnv;
const ADMIN_COOKIE_NAME = "admin_token";
const CUSTOMER_COOKIE_NAME = "velora_customer_token";
const dev = process.argv.includes("--dev");
loadEnvConfig(process.cwd(), dev);

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT) || 3000;
const app = next({ dev, hostname, port, turbopack: dev });
const handle = app.getRequestHandler();

await app.prepare();

function verifyToken(token, role) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.role === role ? decoded : null;
  } catch {
    return null;
  }
}

const server = createServer((request, response) => {
  void handle(request, response);
});
const io = new Server(server);

registerRealtimeServer(io);

io.use((socket, nextSocket) => {
  const cookieHeader = socket.request.headers.cookie || "";
  const cookies = new Map(
    cookieHeader.split(";").map((cookie) => {
      const separator = cookie.indexOf("=");
      if (separator < 0) return ["", ""];

      const name = cookie.slice(0, separator).trim();
      let value = cookie.slice(separator + 1).trim();
      try {
        value = decodeURIComponent(value);
      } catch {
        return [name, ""];
      }
      return [name, value];
    })
  );

  const admin = verifyToken(cookies.get(ADMIN_COOKIE_NAME), "admin");
  if (admin) {
    socket.data.role = "admin";
    socket.join("admins");
    nextSocket();
    return;
  }

  const customer = verifyToken(
    cookies.get(CUSTOMER_COOKIE_NAME),
    "customer"
  );
  if (!customer?.user_id) {
    nextSocket(new Error("Authentication required"));
    return;
  }

  socket.data.role = "customer";
  socket.data.userId = String(customer.user_id);
  socket.join(`customer:${customer.user_id}`);
  nextSocket();
});

server.listen(port, hostname, () => {
  console.log(`> Velora server listening on http://${hostname}:${port}`);
});
