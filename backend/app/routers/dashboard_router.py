"""
Dashboard endpoint — aggregates everything the main dashboard UI needs
into a single call to minimize frontend round-trips.
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, FinancialProfile, Investment, Loan, Goal, Recommendation
from app.schemas import DashboardSummary, AdvisorResponse
from app.auth import get_current_user
from app.services.calculations import (
    calculate_net_worth, calculate_monthly_cash_flow, calculate_savings_ratio,
    calculate_debt_ratio, calculate_emergency_fund_months, calculate_financial_health_score
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardSummary)
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Complete your financial profile first.")

    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    assets = []  # assets are optional extras; net worth still works without them
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()

    net_worth = calculate_net_worth(profile, investments, assets, loans)
    cash_flow = calculate_monthly_cash_flow(profile, loans)
    savings_ratio = calculate_savings_ratio(profile)
    debt_ratio = calculate_debt_ratio(profile, loans)
    emergency_months = calculate_emergency_fund_months(profile)
    health = calculate_financial_health_score(profile, investments, loans, goals)

    recent = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_user.id)
        .order_by(Recommendation.created_at.desc())
        .limit(3)
        .all()
    )
    recent_advice = [
        AdvisorResponse(
            recommendation=r.recommendation,
            reason=r.reason,
            advantages=json.loads(r.advantages or "[]"),
            risks=json.loads(r.risks or "[]"),
            alternative=r.alternative,
            confidence_score=r.confidence_score,
        )
        for r in recent
    ]

    total_investments = sum(i.current_value for i in investments)
    total_loans = sum(l.outstanding_amount for l in loans)

    return DashboardSummary(
        net_worth=net_worth,
        monthly_cash_flow=cash_flow,
        monthly_savings=round(profile.monthly_income - profile.monthly_expenses, 2),
        savings_ratio=savings_ratio,
        debt_ratio=debt_ratio,
        emergency_fund_months=emergency_months,
        total_investments=round(total_investments, 2),
        total_loans=round(total_loans, 2),
        financial_health_score=health["score"],
        goals_count=len(goals),
        recent_recommendations=recent_advice,
    )
