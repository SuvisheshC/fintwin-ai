import { api } from "./api";
import type {
  AuthResponse, FinancialProfile, Investment, Loan, Goal,
  DashboardSummary, AdvisorResponse, FinancialHealth, PredictionResponse, SimulationResult,
} from "../types";

// ---------- Auth ----------
export const registerUser = (data: { full_name: string; email: string; password: string }) =>
  api.post<AuthResponse>("/api/auth/register", data).then((r) => r.data);

export const loginUser = (data: { email: string; password: string }) =>
  api.post<AuthResponse>("/api/auth/login", data).then((r) => r.data);

// ---------- Profile ----------
export const getProfile = () => api.get<FinancialProfile>("/api/profile").then((r) => r.data);
export const updateProfile = (data: FinancialProfile) =>
  api.put<FinancialProfile>("/api/profile", data).then((r) => r.data);

// ---------- Investments ----------
export const listInvestments = () => api.get<Investment[]>("/api/investments").then((r) => r.data);
export const createInvestment = (data: Investment) =>
  api.post<Investment>("/api/investments", data).then((r) => r.data);
export const deleteInvestment = (id: number) => api.delete(`/api/investments/${id}`);

// ---------- Loans ----------
export const listLoans = () => api.get<Loan[]>("/api/loans").then((r) => r.data);
export const createLoan = (data: Loan) => api.post<Loan>("/api/loans", data).then((r) => r.data);
export const deleteLoan = (id: number) => api.delete(`/api/loans/${id}`);

// ---------- Goals ----------
export const listGoals = () => api.get<Goal[]>("/api/goals").then((r) => r.data);
export const createGoal = (data: Goal) => api.post<Goal>("/api/goals", data).then((r) => r.data);
export const deleteGoal = (id: number) => api.delete(`/api/goals/${id}`);

// ---------- Dashboard ----------
export const getDashboard = () => api.get<DashboardSummary>("/api/dashboard").then((r) => r.data);

// ---------- Financial Health ----------
export const getHealthScore = () => api.get<FinancialHealth>("/api/health-score").then((r) => r.data);

// ---------- Predictions ----------
export const getPredictions = (horizonYears: number) =>
  api.get<PredictionResponse>(`/api/predict?horizon_years=${horizonYears}`).then((r) => r.data);

// ---------- Scenario Simulation ----------
export const runSimulation = (scenario_type: string, params: Record<string, unknown>) =>
  api.post<SimulationResult>("/api/simulate", { scenario_type, params }).then((r) => r.data);

// ---------- AI Advisor ----------
export const askAdvisor = (question: string) =>
  api.post<AdvisorResponse>("/api/advisor/ask", { question }).then((r) => r.data);
export const getAdvisorHistory = () => api.get("/api/advisor/history").then((r) => r.data);
