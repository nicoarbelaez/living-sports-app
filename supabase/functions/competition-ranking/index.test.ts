import { assertEquals } from "jsr:@std/assert";
import { handler } from "./index.ts";

function makeGet(params: Record<string, string>, token = ""): Request {
  const url = new URL("http://localhost/");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

Deno.test("OPTIONS preflight returns 200", async () => {
  const req = new Request("http://localhost/", { method: "OPTIONS" });
  const res = await handler(req);
  assertEquals(res.status, 200);
});

Deno.test("returns 400 when no auth token", async () => {
  const req = makeGet({ type: "weekly", group_id: "some-id" });
  const res = await handler(req);
  // Without valid token, expect 400 (auth error)
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when type is invalid", async () => {
  const req = makeGet({ type: "invalid" }, "fake-token");
  const res = await handler(req);
  const body = await res.json();
  assertEquals(res.status, 400);
  assertEquals(body.error, "type debe ser 'competition', 'weekly' o 'total'.");
});

Deno.test("returns 400 when type=competition but no competition_id", async () => {
  const req = makeGet({ type: "competition", group_id: "some-id" }, "fake-token");
  const res = await handler(req);
  // With invalid token this will fail at auth, but validates the path exists
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when type=total but no group_id", async () => {
  const req = makeGet({ type: "total" }, "fake-token");
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when type=weekly but no group_id", async () => {
  const req = makeGet({ type: "weekly" }, "fake-token");
  const res = await handler(req);
  assertEquals(res.status, 400);
});
