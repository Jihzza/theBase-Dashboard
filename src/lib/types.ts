export type LogEntry = {
  id: string;
  created_at: string;
  timestamp: string;
  project: string;
  title: string;
  details: string | null;
  status: "todo" | "doing" | "done" | string;
  tags: string[] | null;
  links: string[] | null;
  source: string | null;
};
