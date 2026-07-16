"""
Scenario simulation endpoint — runs the what-if engine for a given decision type.
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, FinancialProfile, Investment, Loan, Goal, Simulation
from app.schemas import SimulationRequest, SimulationOut
from app.auth import get_current_user
from app.services.scenario_engine import run_simulation, SCENARIO_HANDLERS

router = APIRouter(prefix="/api/simulate", tags=["Scenario Simulation"])


@router.get("/types")
def list_scenario_types():
    return {"scenario_types": list(SCENARIO_HANDLERS.keys())}


@router.post("", response_model=SimulationOut)
def simulate(payload: SimulationRequest, current_user: User = Depends(get_current_user),
             db: Session = Depends(get_db)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Complete your financial profile first.")

    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()

    try:
        result = run_simulation(payload.scenario_type, profile, investments, loans, goals, payload.params)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Persist the simulation for history/reporting
    sim_record = Simulation(
        user_id=current_user.id,
        scenario_type=payload.scenario_type,
        input_params=json.dumps(payload.params),
        result_json=json.dumps(result),
    )
    db.add(sim_record)
    db.commit()

    return result


@router.get("/history")
def simulation_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = (
        db.query(Simulation)
        .filter(Simulation.user_id == current_user.id)
        .order_by(Simulation.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": r.id,
            "scenario_type": r.scenario_type,
            "result": json.loads(r.result_json),
            "created_at": r.created_at,
        }
        for r in records
    ]
