"""
AI Financial Advisor endpoint — answers free-text financial questions using
the user's real financial data, with an explainable, structured response.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, FinancialProfile, Investment, Loan, Goal, Recommendation
from app.schemas import AdvisorQuery, AdvisorResponse
from app.auth import get_current_user
from app.services.ai_advisor import get_advice
import json

router = APIRouter(prefix="/api/advisor", tags=["AI Advisor"])


@router.post("/ask", response_model=AdvisorResponse)
async def ask_advisor(payload: AdvisorQuery, current_user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Complete your financial profile first.")

    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()

    advice = await get_advice(payload.question, profile, investments, loans, goals)

    record = Recommendation(
        user_id=current_user.id,
        question=payload.question,
        recommendation=advice["recommendation"],
        reason=advice["reason"],
        advantages=json.dumps(advice["advantages"]),
        risks=json.dumps(advice["risks"]),
        alternative=advice["alternative"],
        confidence_score=advice["confidence_score"],
    )
    db.add(record)
    db.commit()

    return advice


@router.get("/history")
def advisor_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_user.id)
        .order_by(Recommendation.created_at.desc())
        .limit(30)
        .all()
    )
    return [
        {
            "id": r.id,
            "question": r.question,
            "recommendation": r.recommendation,
            "reason": r.reason,
            "advantages": json.loads(r.advantages or "[]"),
            "risks": json.loads(r.risks or "[]"),
            "alternative": r.alternative,
            "confidence_score": r.confidence_score,
            "created_at": r.created_at,
        }
        for r in records
    ]
