import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.error("Missing SUPABASE_URL or VITE_SUPABASE_URL env var.");
  process.exit(1);
}

if (!key) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY env var.");
  process.exit(1);
}

const [title, details = "", tagsCsv = "", linksCsv = ""] = process.argv.slice(2);

if (!title) {
  console.error("Usage: node scripts/log-step.mjs \"Title\" \"Details\" \"tag1,tag2\" \"https://link\"");
  process.exit(1);
}

const tags = tagsCsv ? tagsCsv.split(",").map((t) => t.trim()).filter(Boolean) : null;
const links = linksCsv ? linksCsv.split(",").map((t) => t.trim()).filter(Boolean) : null;

const supabase = createClient(url, key, { auth: { persistSession: false } });

const payload = {
  project: "theBase",
  title,
  details: details || null,
  tags,
  links,
  status: "done",
  source: "clawdbot",
};

const { error } = await supabase.from("logs").insert(payload);

if (error) {
  console.error("Failed to insert log:", error.message);
  process.exit(1);
}

console.log("Log inserted.");
