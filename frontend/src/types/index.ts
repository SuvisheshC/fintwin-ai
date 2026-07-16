export interface User {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface FinancialProfile {
  id?: number;
  age: number;
  monthly_income: number;
  monthly_expenses: number;
  current_savings: number;
  emergency_fund: number;
  total_investments: number;
  total_loans: number;
  insurance_cover: number;
  retirement_age_goal: number;
  risk_appetite: "low" | "moderate" | "high";
}

export interface Investment {
  id?: number;
  name: string;
  category: string;
  amount_invested: number;
  current_value: number;
  expected_annual_return: number;
  created_at?: string;
}

export interface Loan {
  id?: number;
  name: string;
  loan_type: string;
  principal: number;
  outstanding_amount: number;
  interest_rate: number;
  emi: number;
  tenure_months: number;
  created_at?: string;
}

export interface Goal {
  id?: number;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  priority: "low" | "medium" | "high";
  created_at?: string;
}

export interface DashboardSummary {
  net_worth: number;
  monthly_cash_flow: number;
  monthly_savings: number;
  savings_ratio: number;
  debt_ratio: number;
  emergency_fund_months: number;
  total_investments: number;
  total_loans: number;
  financial_health_score: number;
  goals_count: number;
  recent_recommendations: AdvisorResponse[];
}

export interface AdvisorResponse {
  recommendation: string;
  reason: string;
  advantages: string[];
  risks: string[];
  alternative: string;
  confidence_score: number;
}

export interface FinancialHealth {
  score: number;
  savings_ratio: number;
  debt_ratio: number;
  cash_flow: number;
  insurance_adequacy: number;
  emergency_fund_months: number;
  investment_diversity_score: number;
  goal_progress: number;
  insights: string[];
  recommendations: string[];
  rating: "poor" | "fair" | "good" | "excellent";
}

export interface PredictionPoint {
  year: number;
  net_worth: number;
  savings: number;
  investment_value: number;
  expenses: number;
  income: number;
}

export interface PredictionResponse {
  horizon_years: number;
  timeline: PredictionPoint[];
  retirement_corpus_estimate: number;
  emergency_fund_target: number;
}

export interface ScenarioResult {
  label: string;
  future_net_worth: number;
  future_savings: number;
  monthly_cash_flow: number;
  financial_health_score: number;
  retirement_impact: string;
  goal_achievement: string;
  risk_level: string;
  notes: string[];
}

export interface SimulationResult {
  scenario_type: string;
  scenarios: ScenarioResult[];
  best_option: string;
  explanation: string;
}
