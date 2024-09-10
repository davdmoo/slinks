import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { Edge } from "npm:edge.js";
import { db } from "./db.ts";
import { slinks } from "./handlers/slinks.handler.ts";

const app = new Hono();

export const edge = Edge.create();
edge.mount(new URL("./views", import.meta.url));

app.use("/static/*", serveStatic({ root: "/" }));
app.use("/favicon.ico", serveStatic({ path: "/static/icon.svg" }));

app.get("/", async (c) => {
  const indexPage = await edge.render("index");
  return c.html(indexPage);
});

app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const queryResult = await db.execute({
    sql: "SELECT * FROM slinks WHERE id = (:id);",
    args: { id },
  });
  const slink = queryResult.rows.at(0);
  if (slink === undefined) {
    const errorPage = await edge.render("error", {
      statusCode: 404,
      message: "Not found",
    });
    return c.html(errorPage);
  }

  return c.redirect(slink.url as string, 302);
});

app.route("/slinks", slinks);

Deno.serve(app.fetch);
