import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { appRouter } from "@repo/trpc";
import { createContext, ee } from "./context";
import { getRequestListener, createAdaptorServer } from "@hono/node-server";
import { createIssuer } from "@repo/auth";
import {
  getDB,
  GOOGLE_CLIENT_ID,
  GOOGLE_SECTET_ID,
  valkey,
  valkeyBloacking,
} from "./config";
import cors from "cors";
import { listenResponseQueue } from "@repo/valkey";
import { WebSocketServer } from "ws";
import { createServer } from "http";

const db = getDB();

const app = express();
app.use(cors());
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const authHandler = getRequestListener(
  createIssuer(GOOGLE_CLIENT_ID, GOOGLE_SECTET_ID, db).fetch
);

app.use("/", async (req, res) => {
  await authHandler(req, res);
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext,
  keepAlive: {
    enabled: true,
    pingMs: 30000,
    pongWaitMs: 5000,
  },
});

wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});

listenResponseQueue(db, valkeyBloacking, ee);
