"""
Predictive analytics endpoints — forecasts net worth, savings, and investments
over selectable time horizons (1, 5, 10, 20, 30 years).
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, FinancialProfile, Investment, Loan
from app.schemas import PredictionResponse
from app.auth import get_current_user
from app.services.predictions import project_timeline, estimate_retirement_corpus, estimate_emergency_fund_target

router = APIRouter(prefix="/api/predict", tags=["Predictive Analytics"])


@router.get("", response_model=PredictionResponse)
def predict(horizon_years: int = Query(5, ge=1, le=30), current_user: User = Depends(get_current_user),
            db: Session = Depends(get_db)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Complete your financial profile first.")

    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()

    timeline = project_timeline(profile, investments, loans, horizon_years)
    retirement_corpus = estimate_retirement_corpus(profile, investments, loans)
    emergency_target = estimate_emergency_fund_target(profile)

    return PredictionResponse(
        horizon_years=horizon_years,
        timeline=timeline,
        retirement_corpus_estimate=retirement_corpus,
        emergency_fund_target=emergency_target,
    )
