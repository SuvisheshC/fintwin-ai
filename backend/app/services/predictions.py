"""
Predictive analytics engine.
Projects income, expenses, investments and net worth forward in time using
simple compound-growth modelling. This is intentionally transparent/explainable
rather than a black-box ML model, since users need to trust financial forecasts.
"""
from typing import List, Dict
from app.models import FinancialProfile, Investment, Loan

ANNUAL_INCOME_GROWTH = 0.07      # 7% average salary growth
ANNUAL_INFLATION = 0.06          # 6% average inflation (expense growth)
DEFAULT_INVESTMENT_RETURN = 0.10  # 10% if no investments on record


def project_timeline(profile: FinancialProfile, investments: List[Investment],
                      loans: List[Loan], years: int) -> List[Dict]:
    timeline = []

    income = profile.monthly_income * 12
    expenses = profile.monthly_expenses * 12
    savings = profile.current_savings + profile.emergency_fund
    investment_value = sum(i.current_value for i in investments) or profile.total_investments
    outstanding_loans = sum(l.outstanding_amount for l in loans) or profile.total_loans

    avg_return = DEFAULT_INVESTMENT_RETURN
    if investments:
        avg_return = sum(i.expected_annual_return for i in investments) / len(investments) / 100

    total_emi_annual = sum(l.emi for l in loans) * 12

    for year in range(0, years + 1):
        net_worth = savings + investment_value - outstanding_loans
        timeline.append({
            "year": year,
            "net_worth": round(net_worth, 2),
            "savings": round(savings, 2),
            "investment_value": round(investment_value, 2),
            "expenses": round(expenses, 2),
            "income": round(income, 2),
        })

        # advance one year
        income *= (1 + ANNUAL_INCOME_GROWTH)
        expenses *= (1 + ANNUAL_INFLATION)
        annual_surplus = max(income - expenses - total_emi_annual, 0)
        savings += annual_surplus * 0.4   # 40% of surplus goes to liquid savings
        investment_value = (investment_value + annual_surplus * 0.6) * (1 + avg_return)
        outstanding_loans = max(outstanding_loans - total_emi_annual * 0.6, 0)  # rough principal reduction

    return timeline


def estimate_retirement_corpus(profile: FinancialProfile, investments: List[Investment],
                                loans: List[Loan]) -> float:
    years_to_retirement = max(profile.retirement_age_goal - profile.age, 0)
    timeline = project_timeline(profile, investments, loans, years_to_retirement)
    return timeline[-1]["net_worth"] if timeline else 0.0


def estimate_emergency_fund_target(profile: FinancialProfile) -> float:
    return round(profile.monthly_expenses * 6, 2)
