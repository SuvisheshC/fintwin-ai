"""
Pydantic schemas used for request validation and response serialization.
"""
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Financial Profile ----------

class FinancialProfileBase(BaseModel):
    age: int = 25
    monthly_income: float = 0
    monthly_expenses: float = 0
    current_savings: float = 0
    emergency_fund: float = 0
    total_investments: float = 0
    total_loans: float = 0
    insurance_cover: float = 0
    retirement_age_goal: int = 60
    risk_appetite: str = "moderate"


class FinancialProfileUpdate(FinancialProfileBase):
    pass


class FinancialProfileOut(FinancialProfileBase):
    id: int
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Investments ----------

class InvestmentBase(BaseModel):
    name: str
    category: str = "mutual_fund"
    amount_invested: float = 0
    current_value: float = 0
    expected_annual_return: float = 10.0


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentOut(InvestmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Loans ----------

class LoanBase(BaseModel):
    name: str
    loan_type: str = "personal"
    principal: float = 0
    outstanding_amount: float = 0
    interest_rate: float = 8.5
    emi: float = 0
    tenure_months: int = 12


class LoanCreate(LoanBase):
    pass


class LoanOut(LoanBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Assets ----------

class AssetBase(BaseModel):
    name: str
    asset_type: str = "other"
    current_value: float = 0


class AssetCreate(AssetBase):
    pass


class AssetOut(AssetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Goals ----------

class GoalBase(BaseModel):
    title: str
    target_amount: float = 0
    current_amount: float = 0
    target_date: Optional[datetime] = None
    priority: str = "medium"


class GoalCreate(GoalBase):
    pass


class GoalOut(GoalBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Simulation ----------

class SimulationRequest(BaseModel):
    scenario_type: str  # buy_home, buy_car, marriage, higher_education, job_change, retirement, start_business, vacation
    params: dict = {}


class ScenarioResult(BaseModel):
    label: str
    future_net_worth: float
    future_savings: float
    monthly_cash_flow: float
    financial_health_score: float
    retirement_impact: str
    goal_achievement: str
    risk_level: str
    notes: List[str] = []


class SimulationOut(BaseModel):
    scenario_type: str
    scenarios: List[ScenarioResult]
    best_option: str
    explanation: str


# ---------- Predictions ----------

class PredictionPoint(BaseModel):
    year: int
    net_worth: float
    savings: float
    investment_value: float
    expenses: float
    income: float


class PredictionResponse(BaseModel):
    horizon_years: int
    timeline: List[PredictionPoint]
    retirement_corpus_estimate: float
    emergency_fund_target: float


# ---------- Financial Health ----------

class FinancialHealthResponse(BaseModel):
    score: int
    savings_ratio: float
    debt_ratio: float
    cash_flow: float
    insurance_adequacy: float
    emergency_fund_months: float
    investment_diversity_score: float
    goal_progress: float
    insights: List[str]
    recommendations: List[str]
    rating: str  # poor, fair, good, excellent


# ---------- AI Advisor ----------

class AdvisorQuery(BaseModel):
    question: str


class AdvisorResponse(BaseModel):
    recommendation: str
    reason: str
    advantages: List[str]
    risks: List[str]
    alternative: str
    confidence_score: float


# ---------- Dashboard ----------

class DashboardSummary(BaseModel):
    net_worth: float
    monthly_cash_flow: float
    monthly_savings: float
    savings_ratio: float
    debt_ratio: float
    emergency_fund_months: float
    total_investments: float
    total_loans: float
    financial_health_score: int
    goals_count: int
    recent_recommendations: List[AdvisorResponse] = []
