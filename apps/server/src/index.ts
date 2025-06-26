import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "@repo/trpc";
import { createContext } from "./context";
import { getRequestListener, createAdaptorServer } from "@hono/node-server";
import { createIssuer } from "@repo/auth";
import { getDB, GOOGLE_CLIENT_ID, GOOGLE_SECTET_ID, valkey, valkeyBloacking } from "./config";
import cors from "cors"
import { listenResponseQueue } from "@repo/valkey";

const db = getDB()


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

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});

listenResponseQueue(db, valkeyBloacking)