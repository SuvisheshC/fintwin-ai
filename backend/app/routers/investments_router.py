"""
Investment CRUD endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Investment
from app.schemas import InvestmentOut, InvestmentCreate
from app.auth import get_current_user

router = APIRouter(prefix="/api/investments", tags=["Investments"])


@router.get("", response_model=List[InvestmentOut])
def list_investments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Investment).filter(Investment.user_id == current_user.id).all()


@router.post("", response_model=InvestmentOut, status_code=201)
def create_investment(payload: InvestmentCreate, current_user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    investment = Investment(user_id=current_user.id, **payload.model_dump())
    db.add(investment)
    db.commit()
    db.refresh(investment)
    return investment


@router.put("/{investment_id}", response_model=InvestmentOut)
def update_investment(investment_id: int, payload: InvestmentCreate,
                       current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    investment = db.query(Investment).filter(Investment.id == investment_id,
                                              Investment.user_id == current_user.id).first()
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found.")
    for field, value in payload.model_dump().items():
        setattr(investment, field, value)
    db.commit()
    db.refresh(investment)
    return investment


@router.delete("/{investment_id}", status_code=204)
def delete_investment(investment_id: int, current_user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    investment = db.query(Investment).filter(Investment.id == investment_id,
                                              Investment.user_id == current_user.id).first()
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found.")
    db.delete(investment)
    db.commit()
