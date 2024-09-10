import { Hono } from "hono";
import { html } from "hono/html";
import { nanoid } from "npm:nanoid";
import { db } from "../db.ts";

export const slinks = new Hono();

slinks.post("/", async (c) => {
  try {
    const { url } = await c.req.parseBody();

    // check if the url already exists in the DB
    const existingSlinkQueryResult = await db.execute({
      sql: "SELECT * FROM slinks WHERE url = (:url) LIMIT 1",
      args: { url: url as string },
    });

    let slink: Record<string, unknown> | undefined;
    const existingSlink = existingSlinkQueryResult.rows.at(0);
    if (existingSlink === undefined) {
      const id = nanoid(6);
      const queryResult = await db.execute({
        sql: "INSERT INTO slinks (id, url) VALUES (:id, :url) RETURNING *;",
        args: { id, url: url as string },
      });
      slink = queryResult.rows.at(0);
    } else {
      slink = existingSlink;
    }

    if (slink === undefined) {
      return c.html(html`Failed while trying to create a new slink`);
    }

    const redirectUrl = `https://slinks.deno.dev/${slink.id}`;
    return c.html(html`
      <div id="response" class="response">
        <p>${redirectUrl}</p>
        <button id="copy" onclick="writeToClipboard(redirectUrl)">Copy</button>
      </div>
    `);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      console.error(err.stack);
    }
  }
});
