import "jsr:@std/dotenv/load";
import { createClient } from "npm:@libsql/client";

export const db = createClient({
  // url: "file:slinks.sqlite",
  url: Deno.env.get("TURSO_DATABASE_URL")!,
  authToken: Deno.env.get("TURSO_AUTH_TOKEN")!,
});
