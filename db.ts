import "jsr:@std/dotenv/load";
import { createClient } from "npm:@libsql/client";

export const db = createClient({
  // url: "http://127.0.0.1:8080",
  url: Deno.env.get("TURSO_DATABASE_URL") as string,
  authToken: Deno.env.get("TURSO_AUTH_TOKEN") as string,
});
