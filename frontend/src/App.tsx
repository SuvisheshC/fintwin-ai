import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import DigitalTwinPage from "./pages/DigitalTwinPage";
import ScenarioSimulatorPage from "./pages/ScenarioSimulatorPage";
import AIAdvisorPage from "./pages/AIAdvisorPage";
import PredictiveAnalyticsPage from "./pages/PredictiveAnalyticsPage";
import FinancialHealthPage from "./pages/FinancialHealthPage";
import GoalsPage from "./pages/GoalsPage";
import InvestmentsPage from "./pages/InvestmentsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/digital-twin" element={<ProtectedRoute><DigitalTwinPage /></ProtectedRoute>} />
            <Route path="/simulator" element={<ProtectedRoute><ScenarioSimulatorPage /></ProtectedRoute>} />
            <Route path="/advisor" element={<ProtectedRoute><AIAdvisorPage /></ProtectedRoute>} />
            <Route path="/predictions" element={<ProtectedRoute><PredictiveAnalyticsPage /></ProtectedRoute>} />
            <Route path="/health-score" element={<ProtectedRoute><FinancialHealthPage /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
            <Route path="/investments" element={<ProtectedRoute><InvestmentsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
