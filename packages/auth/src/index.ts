import { z } from "zod";
import { createSubjects } from "@openauthjs/openauth/subject";
import { issuer } from "@openauthjs/openauth";
import { THEME_SST } from "@openauthjs/openauth/ui/theme";
import { GoogleProvider } from "@openauthjs/openauth/provider/google";
import { MemoryStorage } from "@openauthjs/openauth/storage/memory";
import { Hono } from "hono";

export const subjects = createSubjects({
  user: z.object({
    userId: z.string(),
  })
});

type Subjects = typeof subjects;

export type Subject = {
  [K in keyof Subjects]: { type: K; properties: z.infer<Subjects[K]> };
}[keyof Subjects];

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

console.log(process.env.GOOGLE_CLIENT_ID);


export const createIssuer = (googleClientId: string, googleClientSecret: string) => issuer({
  theme: THEME_SST,
  providers: {
    google: GoogleProvider({
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      scopes: ["email", "profile"],
    }),
  },
  storage: MemoryStorage(),
  subjects: subjects,
  success: async (ctx, value) => {
    const id_token: string = value.tokenset.raw.id_token;
    const res = parseJwt(id_token);
    console.log(res);

    return ctx.subject("user", {
      userId: id_token,
    });
  },
});
