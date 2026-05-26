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
  const req = makeFormData({ competition_id: "x", exercise_id: "y", pr_value: "100" }, "");
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when competition_id is missing", async () => {
  const req = makeFormData({ exercise_id: "y", pr_value: "100" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when exercise_id is missing", async () => {
  const req = makeFormData({ competition_id: "x", pr_value: "100" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when pr_value is zero", async () => {
  const req = makeFormData({ competition_id: "x", exercise_id: "y", pr_value: "0" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when pr_value is negative", async () => {
  const req = makeFormData({ competition_id: "x", exercise_id: "y", pr_value: "-5" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when no file attached", async () => {
  const req = makeFormData({ competition_id: "x", exercise_id: "y", pr_value: "100" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when body is invalid json instead of form-data", async () => {
  const req = new Request("http://localhost/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer fake-token" },
    body: JSON.stringify({ competition_id: "x" }),
  });
  const res = await handler(req);
  assertEquals(res.status, 400);
});
