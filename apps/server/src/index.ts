import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "@repo/trpc";
import { createContext } from "./context";
import { getRequestListener, createAdaptorServer } from "@hono/node-server";
import { createIssuer } from "@repo/auth";
import { GOOGLE_CLIENT_ID, GOOGLE_SECTET_ID } from "./config";
import cors from "cors"

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
  createIssuer(GOOGLE_CLIENT_ID, GOOGLE_SECTET_ID).fetch
);

app.use("/", async (req, res) => {
  await authHandler(req, res);
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
