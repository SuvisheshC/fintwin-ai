"""
Financial Health Score endpoint.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, FinancialProfile, Investment, Loan, Goal
from app.schemas import FinancialHealthResponse
from app.auth import get_current_user
from app.services.calculations import calculate_financial_health_score

router = APIRouter(prefix="/api/health-score", tags=["Financial Health"])


@router.get("", response_model=FinancialHealthResponse)
def get_health_score(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Complete your financial profile first.")

    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()

    return calculate_financial_health_score(profile, investments, loans, goals)
