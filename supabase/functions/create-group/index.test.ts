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

Deno.test("returns 400 without auth token", async () => {
  const req = makeFormData({ name: "Test Group" }, "");
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when name is missing", async () => {
  const req = makeFormData({});
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when name is empty string", async () => {
  const req = makeFormData({ name: "" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});
