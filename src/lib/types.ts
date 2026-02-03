export type LogEntry = {
  id: string;
  created_at: string;
  timestamp?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  project: string;
  title: string;
  details: string | null;
  status: "todo" | "doing" | "done" | string;
  tags: string[] | null;
  links: string[] | null;
  source: string | null;
};
