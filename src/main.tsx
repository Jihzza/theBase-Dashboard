import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import InfoPage from "@/pages/Info";
import CronPage from "@/pages/Cron";
import InstructionsPage from "@/pages/Instructions";
import MemoryPage from "@/pages/Memory";
import FilesPage from "@/pages/Files";
import CalendarPage from "@/pages/Calendar";
import LogsPage from "@/pages/Logs";
import DocsPage from "@/pages/Docs";
import TodosPage from "@/pages/Todos";
import BotsPage from "@/pages/Bots";
import BotProfilesPage from "@/pages/BotProfiles";
import BotFeedPage from "@/pages/BotFeed";
import UserProfilePage from "@/pages/UserProfile";
import HealthPage from "@/pages/Health";
import SocialPage from "@/pages/Social";
import MessagesPage from "@/pages/Messages";
import PlanningPage from "@/pages/Planning";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/app/info" element={<InfoPage />} />
        <Route path="/app/cron" element={<CronPage />} />
        <Route path="/app/instructions" element={<InstructionsPage />} />
        <Route path="/app/memory" element={<MemoryPage />} />
        <Route path="/app/files" element={<FilesPage />} />
        <Route path="/app/docs" element={<DocsPage />} />
        <Route path="/app/calendar" element={<CalendarPage />} />
        <Route path="/app/logs" element={<LogsPage />} />
        <Route path="/app/todos" element={<TodosPage />} />
        <Route path="/app/planning" element={<PlanningPage />} />
        <Route path="/app/health" element={<HealthPage />} />
        <Route path="/app/social" element={<SocialPage />} />
        <Route path="/app/messages" element={<MessagesPage />} />
        <Route path="/app/bots" element={<BotsPage />} />
        <Route path="/app/bot-profiles" element={<BotProfilesPage />} />
        <Route path="/app/bot-feed" element={<BotFeedPage />} />
        <Route path="/app/profile" element={<UserProfilePage />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
