import { createClient } from "@openauthjs/openauth/client"

export const auth = createClient({
  clientID: "server",
  issuer: `http://localhost:3000`,
})