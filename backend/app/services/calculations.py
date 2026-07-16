"""
Core financial calculation engine — the "Digital Twin" math.
All functions are pure and take simple numeric inputs so they can be
reused across the dashboard, scenario simulator, and predictions.
"""
from typing import List, Dict
from app.models import FinancialProfile, Investment, Loan, Asset, Goal


def calculate_net_worth(profile: FinancialProfile, investments: List[Investment],
                         assets: List[Asset], loans: List[Loan]) -> float:
    total_investment_value = sum(i.current_value for i in investments)
    total_asset_value = sum(a.current_value for a in assets)
    total_liabilities = sum(l.outstanding_amount for l in loans)
    liquid = profile.current_savings + profile.emergency_fund
    return round(liquid + total_investment_value + total_asset_value - total_liabilities, 2)


def calculate_monthly_cash_flow(profile: FinancialProfile, loans: List[Loan]) -> float:
    total_emi = sum(l.emi for l in loans)
    return round(profile.monthly_income - profile.monthly_expenses - total_emi, 2)


def calculate_savings_ratio(profile: FinancialProfile) -> float:
    if profile.monthly_income <= 0:
        return 0.0
    monthly_savings = profile.monthly_income - profile.monthly_expenses
    return round(max(monthly_savings / profile.monthly_income, 0) * 100, 2)


def calculate_debt_ratio(profile: FinancialProfile, loans: List[Loan]) -> float:
    if profile.monthly_income <= 0:
        return 0.0
    total_emi = sum(l.emi for l in loans)
    return round((total_emi / profile.monthly_income) * 100, 2)


def calculate_emergency_fund_months(profile: FinancialProfile) -> float:
    if profile.monthly_expenses <= 0:
        return 0.0
    return round(profile.emergency_fund / profile.monthly_expenses, 1)


def calculate_investment_diversity(investments: List[Investment]) -> float:
    """Score 0-100 based on number of distinct categories held."""
    if not investments:
        return 0.0
    categories = set(i.category for i in investments)
    # Up to 6 well-known categories gives full diversity score
    return round(min(len(categories) / 6, 1.0) * 100, 2)


def calculate_goal_progress(goals: List[Goal]) -> float:
    if not goals:
        return 0.0
    progresses = []
    for g in goals:
        if g.target_amount > 0:
            progresses.append(min(g.current_amount / g.target_amount, 1.0) * 100)
    if not progresses:
        return 0.0
    return round(sum(progresses) / len(progresses), 2)


def calculate_insurance_adequacy(profile: FinancialProfile) -> float:
    """Rule of thumb: insurance cover should be ~10x annual income."""
    annual_income = profile.monthly_income * 12
    if annual_income <= 0:
        return 0.0
    ideal_cover = annual_income * 10
    return round(min(profile.insurance_cover / ideal_cover, 1.0) * 100, 2) if ideal_cover > 0 else 0.0


def calculate_financial_health_score(profile: FinancialProfile, investments: List[Investment],
                                      loans: List[Loan], goals: List[Goal]) -> Dict:
    savings_ratio = calculate_savings_ratio(profile)
    debt_ratio = calculate_debt_ratio(profile, loans)
    cash_flow = calculate_monthly_cash_flow(profile, loans)
    emergency_months = calculate_emergency_fund_months(profile)
    diversity = calculate_investment_diversity(investments)
    goal_progress = calculate_goal_progress(goals)
    insurance_adequacy = calculate_insurance_adequacy(profile)

    # Weighted scoring out of 100
    savings_score = min(savings_ratio / 30, 1.0) * 25          # ideal >=30% savings
    debt_score = max(1 - (debt_ratio / 40), 0) * 20             # ideal <40% debt ratio
    cash_flow_score = (15 if cash_flow > 0 else 0)
    emergency_score = min(emergency_months / 6, 1.0) * 15       # ideal 6 months
    diversity_score = (diversity / 100) * 10
    goal_score = (goal_progress / 100) * 10
    insurance_score = (insurance_adequacy / 100) * 5

    total = savings_score + debt_score + cash_flow_score + emergency_score + \
        diversity_score + goal_score + insurance_score
    score = int(round(total))

    insights = []
    recommendations = []

    if savings_ratio < 20:
        insights.append("Your savings ratio is below the recommended 20-30% range.")
        recommendations.append("Try to increase your monthly savings rate by trimming discretionary expenses.")
    else:
        insights.append("Your savings ratio is healthy.")

    if debt_ratio > 40:
        insights.append("Your debt-to-income ratio is higher than the recommended 40% limit.")
        recommendations.append("Consider prepaying high-interest loans to bring your debt ratio down.")

    if emergency_months < 6:
        insights.append(f"Your emergency fund covers only {emergency_months} months of expenses.")
        recommendations.append("Build your emergency fund to cover at least 6 months of expenses.")
    else:
        insights.append("Your emergency fund is well-stocked.")

    if diversity < 50:
        recommendations.append("Diversify your investment portfolio across more asset classes.")

    if insurance_adequacy < 70:
        recommendations.append("Your life/health insurance cover may be inadequate — consider increasing it.")

    if cash_flow <= 0:
        insights.append("Your monthly cash flow is negative — expenses and EMIs exceed income.")
        recommendations.append("Review and reduce monthly expenses or restructure loan EMIs urgently.")

    if score >= 80:
        rating = "excellent"
    elif score >= 60:
        rating = "good"
    elif score >= 40:
        rating = "fair"
    else:
        rating = "poor"

    return {
        "score": max(min(score, 100), 0),
        "savings_ratio": savings_ratio,
        "debt_ratio": debt_ratio,
        "cash_flow": cash_flow,
        "insurance_adequacy": insurance_adequacy,
        "emergency_fund_months": emergency_months,
        "investment_diversity_score": diversity,
        "goal_progress": goal_progress,
        "insights": insights,
        "recommendations": recommendations,
        "rating": rating,
    }
