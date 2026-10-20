import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";

const secret = "this-is-a-local-test-secret-with-minimum-32-chars";
const port = 18735;
const endpoint = `http://127.0.0.1:${port}/internal/render-premium-pdf`;
const child = spawn(process.execPath, ["server-dist/pdf-service.cjs"], {
  env: { ...process.env, MDX2_PDF_SHARED_SECRET: secret, MDX2_PDF_PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});
let errors = "";
child.stderr.on("data", b => { errors += b.toString(); });
const ready = new Promise((resolve, reject) => {
  let done = false;
  const time = setTimeout(() => { if (!done) reject(new Error("renderer readiness timeout: " + errors)); }, 20_000);
  child.stdout.on("data", b => { if (!done && b.toString().includes("ready on loopback")) { done = true; clearTimeout(time); resolve(); } });
  child.once("exit", code => { if (!done) { done = true; clearTimeout(time); reject(new Error("renderer exited: " + code + ", " + errors)); } });
});
const request = (body, signature) => {
  const stamp = String(Math.floor(Date.now() / 1000));
  const sig = signature ?? createHmac("sha256", secret).update(stamp + "." + body).digest("hex");
  return fetch(endpoint, { method: "POST", headers: {
    "Content-Type": "application/json", "x-mdx2-timestamp": stamp, "x-mdx2-signature": sig,
  }, body, signal: AbortSignal.timeout(90_000) });
};
test("private renderer fails closed then delivers a personalized PDF with valid server signature", { timeout: 100_000 }, async () => {
  try {
    await ready;
    let r = await fetch(endpoint, { method: "GET" });
    assert.equal(r.status, 404);
    r = await request(JSON.stringify({name:"Amara Nightingale", dob:"1990-05-15"}), "0".repeat(64));
    assert.equal(r.status, 401, "wrong signatures cannot render");
    r = await request(JSON.stringify({name:"Amara Nightingale", dob:"1990-13-41"}));
    assert.equal(r.status, 400, "invalid birth date cannot render");
    r = await request(JSON.stringify({name:"Amara Nightingale", dob:"1990-05-15"}));
    assert.equal(r.status, 200);
    assert.match(r.headers.get("content-type") ?? "", /application\/pdf/);
    assert.match(r.headers.get("cache-control") ?? "", /no-store/);
    const bytes = Buffer.from(await r.arrayBuffer());
    assert.ok(bytes.length > 250_000, "paid PDF should contain full report");
    assert.equal(bytes.subarray(0,5).toString(), "%PDF-");
    assert.ok(bytes.toString("latin1").trimEnd().endsWith("%%EOF"));
  } finally {
    child.kill();
  }
});
