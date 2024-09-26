import { Hono } from "hono";
import { html } from "hono/html";
import { nanoid } from "npm:nanoid";
import QRCode from "npm:qrcode";
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
        <div id="response">
          <p>Failed while trying to create a new slink</p>
        </div>
      `);
    }

    const redirectUrl = `https://slinks.deno.dev/${slink.id}`;
    const qrCode = await QRCode.toDataURL(redirectUrl) as string;

    return c.html(html`
      <div id="response">
        <p>${redirectUrl}</p>
        <div class="actions">
          <button style="border: none;" title="Download QR code">
            <a download="qrcode" href="${qrCode}">
              <svg width="20px" height="20px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M15 12L15 15" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 3V6" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18 12L18 15" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 18L21 18" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18 21H21" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6 12H9" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6 6.01111L6.01 6" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 12.0111L12.01 12" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 12.0111L3.01 12" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 9.01111L12.01 9" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 15.0111L12.01 15" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 21.0111L15.01 21" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 21.0111L12.01 21" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 12.0111L21.01 12" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 15.0111L21.01 15" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18 6.01111L18.01 6" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 3.6V8.4C9 8.73137 8.73137 9 8.4 9H3.6C3.26863 9 3 8.73137 3 8.4V3.6C3 3.26863 3.26863 3 3.6 3H8.4C8.73137 3 9 3.26863 9 3.6Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 3.6V8.4C21 8.73137 20.7314 9 20.4 9H15.6C15.2686 9 15 8.73137 15 8.4V3.6C15 3.26863 15.2686 3 15.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6 18.0111L6.01 18" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 15.6V20.4C9 20.7314 8.73137 21 8.4 21H3.6C3.26863 21 3 20.7314 3 20.4V15.6C3 15.2686 3.26863 15 3.6 15H8.4C8.73137 15 9 15.2686 9 15.6Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </a>
          </button>

          <button style="border: none;" _="on click call navigator.clipboard.writeText('${redirectUrl}') then show #alert" title="Copy to clipboard">
            <svg width="20px" height="20px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M19.4 20H9.6C9.26863 20 9 19.7314 9 19.4V9.6C9 9.26863 9.26863 9 9.6 9H19.4C19.7314 9 20 9.26863 20 9.6V19.4C20 19.7314 19.7314 20 19.4 20Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 9V4.6C15 4.26863 14.7314 4 14.4 4H4.6C4.26863 4 4 4.26863 4 4.6V14.4C4 14.7314 4.26863 15 4.6 15H9" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>
      </div>
    `);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      console.error(err.stack);
    }
  }
});
