"""
Financial profile endpoints — the core data behind the Digital Twin.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, FinancialProfile
from app.schemas import FinancialProfileOut, FinancialProfileUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Financial Profile"])


@router.get("", response_model=FinancialProfileOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        profile = FinancialProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("", response_model=FinancialProfileOut)
def update_profile(payload: FinancialProfileUpdate, current_user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        profile = FinancialProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in payload.model_dump().items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
