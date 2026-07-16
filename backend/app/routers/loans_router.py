"""
Loan CRUD endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Loan
from app.schemas import LoanOut, LoanCreate
from app.auth import get_current_user

router = APIRouter(prefix="/api/loans", tags=["Loans"])


@router.get("", response_model=List[LoanOut])
def list_loans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Loan).filter(Loan.user_id == current_user.id).all()


@router.post("", response_model=LoanOut, status_code=201)
def create_loan(payload: LoanCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loan = Loan(user_id=current_user.id, **payload.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.put("/{loan_id}", response_model=LoanOut)
def update_loan(loan_id: int, payload: LoanCreate, current_user: User = Depends(get_current_user),
                 db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found.")
    for field, value in payload.model_dump().items():
        setattr(loan, field, value)
    db.commit()
    db.refresh(loan)
    return loan


@router.delete("/{loan_id}", status_code=204)
def delete_loan(loan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found.")
    db.delete(loan)
    db.commit()
