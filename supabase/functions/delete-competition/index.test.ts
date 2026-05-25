import { assertEquals } from "jsr:@std/assert";
import { handler } from "./index.ts";

function makeJson(body: unknown, token = "fake-token"): Request {
  return new Request("http://localhost/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

Deno.test("OPTIONS preflight returns 200", async () => {
  const req = new Request("http://localhost/", { method: "OPTIONS" });
  const res = await handler(req);
  assertEquals(res.status, 200);
});

Deno.test("returns 400 without auth", async () => {
  const req = makeJson({ competition_id: "x" }, "");
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when competition_id is missing", async () => {
  const req = makeJson({});
  const res = await handler(req);
  assertEquals(res.status, 400);
});
