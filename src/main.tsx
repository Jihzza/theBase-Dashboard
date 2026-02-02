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
        <Route path="/app/calendar" element={<CalendarPage />} />
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
