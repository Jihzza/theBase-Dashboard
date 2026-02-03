import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const secret = process.env.THEBASE_INGEST_SECRET;
  const got = event.headers["x-thebase-secret"] || event.headers["X-TheBase-Secret"];

  if (!secret) return { statusCode: 500, body: "Missing THEBASE_INGEST_SECRET" };
  if (!got || got !== secret) return { statusCode: 401, body: "Unauthorized" };

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) return { statusCode: 500, body: "Missing SUPABASE_URL (or VITE_SUPABASE_URL)" };
  if (!serviceKey) return { statusCode: 500, body: "Missing SUPABASE_SERVICE_ROLE_KEY" };

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(event.body || "{}") as Record<string, unknown>;
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const supabase = createClient(url, serviceKey);

  const { error } = await supabase.from("cron_snapshot").insert({
    payload,
    source: "clawdbot",
  });

  if (error) return { statusCode: 500, body: `Insert failed: ${error.message}` };

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true }),
  };
};
