import { assertEquals } from "jsr:@std/assert";
import { handler } from "./index.ts";

function makeFormData(fields: Record<string, string>): Request {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return new Request("http://localhost/", {
    method: "POST",
    headers: { Authorization: "Bearer fake-token" },
    body: fd,
  });
}

Deno.test("OPTIONS preflight returns 200", async () => {
  const req = new Request("http://localhost/", { method: "OPTIONS" });
  const res = await handler(req);
  assertEquals(res.status, 200);
});

Deno.test("returns 400 without auth", async () => {
  const req = makeFormData({ group_id: "x", title: "T", exercise_id: "y", start_date: "2025-01-01", end_date: "2025-01-07" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when group_id is missing", async () => {
  const req = makeFormData({ title: "Test", exercise_id: "y", start_date: "2025-01-01", end_date: "2025-01-07" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when title is too short", async () => {
  const req = makeFormData({ group_id: "x", title: "ab", exercise_id: "y", start_date: "2025-01-01", end_date: "2025-01-07" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when exercise_id is missing", async () => {
  const req = makeFormData({ group_id: "x", title: "Valid Title", start_date: "2025-01-01", end_date: "2025-01-07" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("returns 400 when end_date before start_date", async () => {
  const req = makeFormData({ group_id: "x", title: "Valid Title", exercise_id: "y", start_date: "2025-01-07", end_date: "2025-01-01" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});
