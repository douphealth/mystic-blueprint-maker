/**
 * Private PDF renderer, run on infrastructure controlled by the merchant.
 * Bind to 127.0.0.1 only. Reverse proxies MUST NOT expose this HTTP port.
 * Build: npm run build:pdf-server
 * Run: MDX2_PDF_SHARED_SECRET=<secret-from-secret-store> node server-dist/pdf-service.cjs
 */
import { createServer } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { generateBlueprintPdf } from "./blueprintPdfPremium";
import { calculateFullProfile } from "../src/lib/numerology";
const secret = process.env.MDX2_PDF_SHARED_SECRET ?? "";
if (secret.length < 32) throw new Error("MDX2_PDF_SHARED_SECRET must be configured (32+ chars)");
const port = Number(process.env.MDX2_PDF_PORT ?? "8735");
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid port");

createServer(async (req, res) => {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST" || req.url !== "/internal/render-premium-pdf") {
    res.writeHead(404); return res.end();
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.from(chunk);
    size += buf.length;
    if (size > 4096) {
      res.writeHead(413); return res.end();
    }
    chunks.push(buf);
  }
  const body = Buffer.concat(chunks);
  const stamp = req.headers["x-mdx2-timestamp"];
  const signature = req.headers["x-mdx2-signature"];
  if (typeof stamp !== "string" || typeof signature !== "string" || !/^\d{10}$/.test(stamp)
    || Math.abs(Date.now() / 1000 - Number(stamp)) > 120) {
    res.writeHead(401); return res.end();
  }
  const calculated = createHmac("sha256", secret).update(stamp).update(".").update(body).digest("hex");
  if (!/^[a-f0-9]{64}$/.test(signature) || !timingSafeEqual(Buffer.from(signature), Buffer.from(calculated))) {
    res.writeHead(401); return res.end();
  }
  try {
    const params: unknown = JSON.parse(body.toString("utf8"));
    if (!params || typeof params !== "object") throw new Error("Invalid input");
    const { name, dob } = params as {name: unknown; dob: unknown};
    if (typeof name !== "string" || typeof dob !== "string"
       || name.trim().length < 1 || name.trim().length > 120
       || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) throw new Error("Invalid inputs");
    const birthDate = new Date(dob + "T12:00:00");
    if (Number.isNaN(birthDate.getTime()) || birthDate.toISOString().slice(0, 10) !== dob) throw new Error("Invalid date");
    const profile = calculateFullProfile(name.trim(), birthDate);
    const pdf = generateBlueprintPdf(profile, name.trim(), {tier:"premium"});
    const bytes = Buffer.from(pdf.output("arraybuffer") as ArrayBuffer);
    res.writeHead(200, {
      "Content-Type":"application/pdf",
      "Content-Length": String(bytes.length),
      "Content-Disposition":"attachment; filename=blueprint-premium.pdf",
    });
    return res.end(bytes);
  } catch (err) {
    console.error("Premium rendering failed:", err instanceof Error ? err.name : "unknown");
    res.writeHead(400); return res.end();
  }
}).listen(port, "127.0.0.1", () => { console.log("Private PDF renderer ready on loopback"); });
