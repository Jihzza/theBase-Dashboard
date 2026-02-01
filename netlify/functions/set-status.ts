import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

type Payload = {
  state: "working" | "idle";
  note?: string;
};

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

  let payload: Payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  if (payload.state !== "working" && payload.state !== "idle") {
    return { statusCode: 400, body: "state must be 'working' or 'idle'" };
  }

  const supabase = createClient(url, serviceKey);

  // Single-row pattern: update the most recent row; if none exists, insert.
  const { data: existing, error: selErr } = await supabase
    .from("agent_status")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selErr) {
    return { statusCode: 500, body: `Select failed: ${selErr.message}` };
  }

  const now = new Date().toISOString();

  if (existing?.id) {
    const { error } = await supabase
      .from("agent_status")
      .update({ state: payload.state, note: payload.note ?? null, updated_at: now })
      .eq("id", existing.id);

    if (error) return { statusCode: 500, body: `Update failed: ${error.message}` };
  } else {
    const { error } = await supabase.from("agent_status").insert({
      state: payload.state,
      note: payload.note ?? null,
      created_at: now,
      updated_at: now,
    });

    if (error) return { statusCode: 500, body: `Insert failed: ${error.message}` };
  }

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true }),
  };
};
