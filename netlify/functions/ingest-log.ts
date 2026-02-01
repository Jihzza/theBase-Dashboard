import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

type IngestPayload = {
  timestamp?: string;
  project: string;
  title: string;
  details?: string;
  status?: string;
  tags?: string[];
  links?: string[];
  source?: string;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const secret = process.env.THEBASE_INGEST_SECRET;
  const got = event.headers["x-thebase-secret"] || event.headers["X-TheBase-Secret"];

  if (!secret) {
    return { statusCode: 500, body: "Missing THEBASE_INGEST_SECRET" };
  }

  if (!got || got !== secret) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    return { statusCode: 500, body: "Missing SUPABASE_URL (or VITE_SUPABASE_URL)" };
  }
  if (!serviceKey) {
    return { statusCode: 500, body: "Missing SUPABASE_SERVICE_ROLE_KEY" };
  }

  let payload: IngestPayload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  if (!payload.project || !payload.title) {
    return { statusCode: 400, body: "project and title are required" };
  }

  const supabase = createClient(url, serviceKey);

  const { error } = await supabase.from("logs").insert({
    timestamp: payload.timestamp ?? new Date().toISOString(),
    project: payload.project,
    title: payload.title,
    details: payload.details ?? null,
    status: payload.status ?? "done",
    tags: payload.tags ?? null,
    links: payload.links ?? null,
    source: payload.source ?? "clawdbot",
  });

  if (error) {
    return { statusCode: 500, body: `Insert failed: ${error.message}` };
  }

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true }),
  };
};
