import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { HistoryPage } from "./pages/HistoryPage";
import { InterviewResult } from "./pages/InterviewResult";
import { InterviewRoom } from "./pages/InterviewRoom";
import { InterviewSetup } from "./pages/InterviewSetup";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Onboarding } from "./pages/Onboarding";
import { ProfilePage } from "./pages/ProfilePage";
import { Register } from "./pages/Register";
import { StudyPlanPage } from "./pages/StudyPlanPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview/new" element={<InterviewSetup />} />
          <Route path="/interview/:id" element={<InterviewRoom />} />
          <Route path="/interview/:id/result" element={<InterviewResult />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/study-plan" element={<StudyPlanPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
