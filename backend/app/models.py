"""
SQLAlchemy ORM models representing the FinTwin AI database schema.
"""
from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
)
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("FinancialProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    investments = relationship("Investment", back_populates="user", cascade="all, delete-orphan")
    loans = relationship("Loan", back_populates="user", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    simulations = relationship("Simulation", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    age = Column(Integer, default=25)
    monthly_income = Column(Float, default=0)
    monthly_expenses = Column(Float, default=0)
    current_savings = Column(Float, default=0)
    emergency_fund = Column(Float, default=0)
    total_investments = Column(Float, default=0)
    total_loans = Column(Float, default=0)
    insurance_cover = Column(Float, default=0)
    retirement_age_goal = Column(Integer, default=60)
    risk_appetite = Column(String, default="moderate")  # low, moderate, high

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String, nullable=False)
    category = Column(String, default="mutual_fund")  # stocks, mutual_fund, fd, gold, crypto, real_estate
    amount_invested = Column(Float, default=0)
    current_value = Column(Float, default=0)
    expected_annual_return = Column(Float, default=10.0)  # percent
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="investments")


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String, nullable=False)
    loan_type = Column(String, default="personal")  # home, car, personal, education
    principal = Column(Float, default=0)
    outstanding_amount = Column(Float, default=0)
    interest_rate = Column(Float, default=8.5)  # percent annual
    emi = Column(Float, default=0)
    tenure_months = Column(Integer, default=12)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="loans")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String, nullable=False)
    asset_type = Column(String, default="other")  # property, vehicle, gold, other
    current_value = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assets")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    target_amount = Column(Float, default=0)
    current_amount = Column(Float, default=0)
    target_date = Column(DateTime, nullable=True)
    priority = Column(String, default="medium")  # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="goals")


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    scenario_type = Column(String, nullable=False)  # buy_home, buy_car, job_change, retirement, etc.
    input_params = Column(Text)  # JSON string of inputs used
    result_json = Column(Text)  # JSON string of computed scenario results
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="simulations")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    horizon_years = Column(Integer, default=5)
    result_json = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    question = Column(Text, nullable=False)
    recommendation = Column(Text)
    reason = Column(Text)
    advantages = Column(Text)  # JSON list
    risks = Column(Text)  # JSON list
    alternative = Column(Text)
    confidence_score = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    category = Column(String, default="general")
    amount = Column(Float, default=0)
    transaction_type = Column(String, default="expense")  # income, expense
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
