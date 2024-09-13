import { Hono } from "hono";
import { html } from "hono/html";
import { nanoid } from "npm:nanoid";
import { db } from "../db.ts";

export const slinks = new Hono();

slinks.post("/", async (c) => {
  try {
    // await new Promise((r) => setTimeout(r, 5000));

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
      return c.html(html`
        <div id="response" class="response">
          <p>Failed while trying to create a new slink</p>
        </div>`);
    }

    const redirectUrl = `https://slinks.deno.dev/${slink.id}`;
    return c.html(html`
      <div id="response" class="response">
        <p>${redirectUrl}</p>
        <button class="icon-button" onclick="writeToClipboard('${redirectUrl}')">
          <svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg" color="#000000">
            <path
              d="M19.4 20H9.6C9.26863 20 9 19.7314 9 19.4V9.6C9 9.26863 9.26863 9 9.6 9H19.4C19.7314 9 20 9.26863 20 9.6V19.4C20 19.7314 19.7314 20 19.4 20Z"
              stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path
              d="M15 9V4.6C15 4.26863 14.7314 4 14.4 4H4.6C4.26863 4 4 4.26863 4 4.6V14.4C4 14.7314 4.26863 15 4.6 15H9"
              stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </button>
      </div>
    `);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      console.error(err.stack);
    }
  }
});
