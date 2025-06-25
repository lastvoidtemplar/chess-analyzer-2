import { z } from "zod";
import { createSubjects } from "@openauthjs/openauth/subject";
import { issuer } from "@openauthjs/openauth";
import { THEME_SST } from "@openauthjs/openauth/ui/theme";
import { GoogleProvider } from "@openauthjs/openauth/provider/google";
import { MemoryStorage } from "@openauthjs/openauth/storage/memory";
import { DB, checkIfUserExistById, createUser, users } from "@repo/db";
import { Hono } from "hono"; // dont touch that

export const subjects = createSubjects({
  user: z.object({
    userId: z.string(),
  }),
});

type Subjects = typeof subjects;

export type Subject = {
  [K in keyof Subjects]: { type: K; properties: z.infer<Subjects[K]> };
}[keyof Subjects];

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

type TokenPayload = {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
};

export const createIssuer = (
  googleClientId: string,
  googleClientSecret: string,
  db: DB
) =>
  issuer({
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
      const payload: TokenPayload = parseJwt(id_token);

      const userExists = await checkIfUserExistById(db, payload.sub);

      if (!userExists) {
        await createUser(db, {
          userId: payload.sub,
          username: payload.name,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        });
      }

      return ctx.subject("user", {
        userId: payload.sub,
      });
    },
  });
