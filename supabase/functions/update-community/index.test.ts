import { assertEquals } from "jsr:@std/assert";
import { handler } from "./index.ts";

function makeFormData(fields: Record<string, string>, token = "fake-token"): Request {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return new Request("http://localhost/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
}

Deno.test("OPTIONS preflight returns 200", async () => {
  const req = new Request("http://localhost/", { method: "OPTIONS" });
  const res = await handler(req);
  assertEquals(res.status, 200);
});

Deno.test("returns 400 without auth", async () => {
  const req = makeFormData({ group_id: "x", name: "New Name" }, "");
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when group_id is missing", async () => {
  const req = makeFormData({ name: "New Name" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when name is too short", async () => {
  const req = makeFormData({ group_id: "x", name: "ab" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when no fields to update", async () => {
  const req = makeFormData({ group_id: "x" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});
