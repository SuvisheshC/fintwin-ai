"""
Scenario simulation engine.
Given a scenario type (buy_home, buy_car, job_change, retirement, etc.) and
parameters, generates 2-3 comparable scenarios (e.g. "Buy now" vs "Wait 2 years")
with projected financial outcomes for each.
"""
from typing import Dict, List
from app.models import FinancialProfile, Investment, Loan
from app.services.predictions import project_timeline
from app.services.calculations import calculate_financial_health_score


def _emi(principal: float, annual_rate: float, months: int) -> float:
    if principal <= 0 or months <= 0:
        return 0.0
    r = annual_rate / 12 / 100
    if r == 0:
        return round(principal / months, 2)
    emi = principal * r * (1 + r) ** months / ((1 + r) ** months - 1)
    return round(emi, 2)


def _score_scenario(profile: FinancialProfile, investments, extra_loans: List[Loan],
                     goals, years_ahead: int, label: str, notes: List[str]) -> Dict:
    combined_loans = list(extra_loans)
    timeline = project_timeline(profile, investments, combined_loans, years_ahead)
    final = timeline[-1]

    # Build a lightweight fake profile snapshot for health score at "today" with new loans
    health = calculate_financial_health_score(profile, investments, combined_loans, goals)

    risk_level = "Low"
    if health["debt_ratio"] > 50:
        risk_level = "High"
    elif health["debt_ratio"] > 30:
        risk_level = "Medium"

    retirement_impact = "On track" if final["net_worth"] > 0 and health["score"] >= 50 else "At risk"
    goal_achievement = "Likely" if health["savings_ratio"] >= 15 else "Uncertain"

    return {
        "label": label,
        "future_net_worth": final["net_worth"],
        "future_savings": final["savings"],
        "monthly_cash_flow": round(health["cash_flow"], 2),
        "financial_health_score": health["score"],
        "retirement_impact": retirement_impact,
        "goal_achievement": goal_achievement,
        "risk_level": risk_level,
        "notes": notes,
    }


def simulate_buy_home(profile: FinancialProfile, investments, loans, goals, params: Dict) -> Dict:
    home_price = params.get("home_price", 5_000_000)
    down_payment = params.get("down_payment", home_price * 0.2)
    loan_amount = home_price - down_payment
    tenure_years = params.get("tenure_years", 20)
    rate = params.get("interest_rate", 8.5)

    emi = _emi(loan_amount, rate, tenure_years * 12)
    home_loan = Loan(name="Home Loan", loan_type="home", principal=loan_amount,
                      outstanding_amount=loan_amount, interest_rate=rate, emi=emi,
                      tenure_months=tenure_years * 12)

    scenario_a = _score_scenario(
        profile, investments, loans + [home_loan], goals, 10,
        "Buy Home Today",
        [f"EMI of ₹{emi:,.0f}/month for {tenure_years} years.",
         "Net worth dips short-term but builds a real-estate asset.",
         "Reduces liquid investable surplus immediately."]
    )

    # Waiting scenario: assume 2 years of extra savings/investment growth before buying, smaller loan needed
    waited_profile = FinancialProfile(
        age=profile.age, monthly_income=profile.monthly_income * 1.14,  # ~7%/yr for 2 yrs
        monthly_expenses=profile.monthly_expenses, current_savings=profile.current_savings,
        emergency_fund=profile.emergency_fund, total_investments=profile.total_investments,
        total_loans=profile.total_loans, insurance_cover=profile.insurance_cover,
        retirement_age_goal=profile.retirement_age_goal, risk_appetite=profile.risk_appetite,
    )
    bigger_down_payment = down_payment * 1.3
    smaller_loan = home_price - bigger_down_payment
    emi_b = _emi(smaller_loan, rate, tenure_years * 12)
    home_loan_b = Loan(name="Home Loan", loan_type="home", principal=smaller_loan,
                        outstanding_amount=smaller_loan, interest_rate=rate, emi=emi_b,
                        tenure_months=tenure_years * 12)

    scenario_b = _score_scenario(
        waited_profile, investments, loans + [home_loan_b], goals, 8,
        "Wait Two Years, Then Buy",
        ["Salary growth and extra savings reduce the loan amount needed.",
         f"Lower EMI of ₹{emi_b:,.0f}/month.",
         "Retirement savings stay on track for longer before the big purchase."]
    )

    scenario_c = _score_scenario(
        profile, investments, loans, goals, 10,
        "Continue Renting & Investing",
        ["No EMI burden — full surplus goes into investments.",
         "No real-estate asset is built; net worth growth depends entirely on markets.",
         "More flexibility, but exposed to rent inflation."]
    )

    return _pick_best("buy_home", [scenario_a, scenario_b, scenario_c])


def simulate_buy_car(profile, investments, loans, goals, params: Dict) -> Dict:
    car_price = params.get("car_price", 1_200_000)
    down_payment = params.get("down_payment", car_price * 0.2)
    loan_amount = car_price - down_payment
    tenure_years = params.get("tenure_years", 5)
    rate = params.get("interest_rate", 9.5)

    emi = _emi(loan_amount, rate, tenure_years * 12)
    car_loan = Loan(name="Car Loan", loan_type="car", principal=loan_amount,
                     outstanding_amount=loan_amount, interest_rate=rate, emi=emi,
                     tenure_months=tenure_years * 12)

    scenario_a = _score_scenario(profile, investments, loans + [car_loan], goals, 5,
        "Buy Car Now (Loan)",
        [f"EMI of ₹{emi:,.0f}/month for {tenure_years} years.", "Car value depreciates over time, unlike an investment."])

    scenario_b = _score_scenario(profile, investments, loans, goals, 5,
        "Save & Buy in Cash Later",
        ["No EMI/interest cost.", "Delays the purchase but avoids ~"
         f"₹{(emi*tenure_years*12 - loan_amount):,.0f} in total interest."])

    scenario_c = _score_scenario(profile, investments, loans, goals, 5,
        "Continue with Current Vehicle / Use Cabs",
        ["Maximizes investable surplus.", "No new liability added to your Digital Twin."])

    return _pick_best("buy_car", [scenario_a, scenario_b, scenario_c])


def simulate_job_change(profile, investments, loans, goals, params: Dict) -> Dict:
    new_salary_multiplier = params.get("salary_change_pct", 20) / 100 + 1
    new_profile = FinancialProfile(
        age=profile.age, monthly_income=profile.monthly_income * new_salary_multiplier,
        monthly_expenses=profile.monthly_expenses, current_savings=profile.current_savings,
        emergency_fund=profile.emergency_fund, total_investments=profile.total_investments,
        total_loans=profile.total_loans, insurance_cover=profile.insurance_cover,
        retirement_age_goal=profile.retirement_age_goal, risk_appetite=profile.risk_appetite,
    )
    scenario_a = _score_scenario(new_profile, investments, loans, goals, 10,
        "Switch Jobs (New Offer)",
        [f"Income changes by {params.get('salary_change_pct', 20)}%.",
         "Factor in joining bonus/notice period gaps separately."])
    scenario_b = _score_scenario(profile, investments, loans, goals, 10,
        "Stay in Current Role",
        ["Assumes standard annual increments only.", "Lower short-term risk, stable income."])

    return _pick_best("job_change", [scenario_a, scenario_b])


def simulate_retirement(profile, investments, loans, goals, params: Dict) -> Dict:
    target_age = params.get("target_retirement_age", 55)
    years_to_target = max(target_age - profile.age, 1)

    scenario_a = _score_scenario(profile, investments, loans, goals, years_to_target,
        f"Retire at {target_age}",
        ["Corpus must support all expenses from this age onward.",
         "Less time for compounding to work in your favor."])

    scenario_b = _score_scenario(profile, investments, loans, goals,
        max(profile.retirement_age_goal - profile.age, 1),
        f"Retire at Planned Age {profile.retirement_age_goal}",
        ["More years of compounding and contributions.", "Larger projected retirement corpus."])

    return _pick_best("retirement", [scenario_a, scenario_b])


def simulate_business(profile, investments, loans, goals, params: Dict) -> Dict:
    capital_needed = params.get("capital_needed", 1_000_000)
    funding_source = params.get("funding_source", "savings")  # savings or loan

    if funding_source == "loan":
        rate = params.get("interest_rate", 14.0)
        tenure_years = params.get("tenure_years", 5)
        emi = _emi(capital_needed, rate, tenure_years * 12)
        biz_loan = Loan(name="Business Loan", loan_type="personal", principal=capital_needed,
                         outstanding_amount=capital_needed, interest_rate=rate, emi=emi,
                         tenure_months=tenure_years * 12)
        scenario_a = _score_scenario(profile, investments, loans + [biz_loan], goals, 5,
            "Start Business (Loan Funded)",
            [f"EMI of ₹{emi:,.0f}/month adds fixed financial risk.",
             "Business income is not guaranteed — high variance outcome."])
    else:
        reduced_savings_profile = FinancialProfile(
            age=profile.age, monthly_income=profile.monthly_income, monthly_expenses=profile.monthly_expenses,
            current_savings=max(profile.current_savings - capital_needed, 0), emergency_fund=profile.emergency_fund,
            total_investments=profile.total_investments, total_loans=profile.total_loans,
            insurance_cover=profile.insurance_cover, retirement_age_goal=profile.retirement_age_goal,
            risk_appetite=profile.risk_appetite,
        )
        scenario_a = _score_scenario(reduced_savings_profile, investments, loans, goals, 5,
            "Start Business (Self-Funded)",
            ["Depletes liquid savings — emergency fund cushion shrinks.",
             "No debt risk, but reduces financial safety net."])

    scenario_b = _score_scenario(profile, investments, loans, goals, 5,
        "Keep Current Job, Save Toward Business",
        ["Builds capital gradually without immediate risk.",
         "Delays entrepreneurial timeline but preserves stability."])

    return _pick_best("start_business", [scenario_a, scenario_b])


def simulate_vacation(profile, investments, loans, goals, params: Dict) -> Dict:
    cost = params.get("trip_cost", 300_000)
    funded_profile = FinancialProfile(
        age=profile.age, monthly_income=profile.monthly_income, monthly_expenses=profile.monthly_expenses,
        current_savings=max(profile.current_savings - cost, 0), emergency_fund=profile.emergency_fund,
        total_investments=profile.total_investments, total_loans=profile.total_loans,
        insurance_cover=profile.insurance_cover, retirement_age_goal=profile.retirement_age_goal,
        risk_appetite=profile.risk_appetite,
    )
    scenario_a = _score_scenario(funded_profile, investments, loans, goals, 3,
        "Go Now (Use Savings)",
        [f"₹{cost:,.0f} drawn directly from savings.", "Check this doesn't dip below your emergency fund target."])
    scenario_b = _score_scenario(profile, investments, loans, goals, 3,
        "Save for 6-12 Months First",
        ["Preserves your emergency fund and investments.", "Trip is delayed but financially safer."])

    return _pick_best("vacation", [scenario_a, scenario_b])


def simulate_higher_education(profile, investments, loans, goals, params: Dict) -> Dict:
    cost = params.get("course_cost", 2_000_000)
    funding_source = params.get("funding_source", "loan")
    rate = params.get("interest_rate", 9.0)
    tenure_years = params.get("tenure_years", 7)

    if funding_source == "loan":
        emi = _emi(cost, rate, tenure_years * 12)
        edu_loan = Loan(name="Education Loan", loan_type="education", principal=cost,
                         outstanding_amount=cost, interest_rate=rate, emi=emi, tenure_months=tenure_years * 12)
        scenario_a = _score_scenario(profile, investments, loans + [edu_loan], goals, 10,
            "Pursue Higher Education (Loan Funded)",
            [f"EMI of ₹{emi:,.0f}/month after course completion.",
             "Expect a salary jump post-qualification — factor that into ROI."])
    else:
        reduced_profile = FinancialProfile(
            age=profile.age, monthly_income=profile.monthly_income, monthly_expenses=profile.monthly_expenses,
            current_savings=max(profile.current_savings - cost, 0), emergency_fund=profile.emergency_fund,
            total_investments=profile.total_investments, total_loans=profile.total_loans,
            insurance_cover=profile.insurance_cover, retirement_age_goal=profile.retirement_age_goal,
            risk_appetite=profile.risk_appetite,
        )
        scenario_a = _score_scenario(reduced_profile, investments, loans, goals, 10,
            "Pursue Higher Education (Self-Funded)",
            ["Uses existing savings — no debt burden.", "Significantly reduces liquidity in the short term."])

    scenario_b = _score_scenario(profile, investments, loans, goals, 10,
        "Skip Further Education, Continue Working",
        ["No additional cost or debt.", "Misses potential salary growth tied to the qualification."])

    return _pick_best("higher_education", [scenario_a, scenario_b])


def simulate_marriage(profile, investments, loans, goals, params: Dict) -> Dict:
    cost = params.get("wedding_cost", 1_500_000)
    funded_profile = FinancialProfile(
        age=profile.age, monthly_income=profile.monthly_income, monthly_expenses=profile.monthly_expenses,
        current_savings=max(profile.current_savings - cost, 0), emergency_fund=profile.emergency_fund,
        total_investments=profile.total_investments, total_loans=profile.total_loans,
        insurance_cover=profile.insurance_cover, retirement_age_goal=profile.retirement_age_goal,
        risk_appetite=profile.risk_appetite,
    )
    scenario_a = _score_scenario(funded_profile, investments, loans, goals, 5,
        "Full Budget Wedding",
        [f"₹{cost:,.0f} spent upfront from savings/investments.", "Consider combined household income post-marriage."])
    scenario_b = _score_scenario(profile, investments, loans, goals, 5,
        "Budget-Conscious Wedding (50% cost)",
        ["Preserves more of your investment base.", "Redirect savings toward joint financial goals instead."])

    return _pick_best("marriage", [scenario_a, scenario_b])


SCENARIO_HANDLERS = {
    "buy_home": simulate_buy_home,
    "buy_car": simulate_buy_car,
    "job_change": simulate_job_change,
    "retirement": simulate_retirement,
    "start_business": simulate_business,
    "vacation": simulate_vacation,
    "higher_education": simulate_higher_education,
    "marriage": simulate_marriage,
}


def _pick_best(scenario_type: str, scenarios: List[Dict]) -> Dict:
    best = max(scenarios, key=lambda s: s["financial_health_score"])
    explanation = (
        f"'{best['label']}' is recommended because it results in the highest projected financial "
        f"health score ({best['financial_health_score']}/100) among the simulated options, with a "
        f"future net worth of ₹{best['future_net_worth']:,.0f} and {best['risk_level'].lower()} risk."
    )
    return {
        "scenario_type": scenario_type,
        "scenarios": scenarios,
        "best_option": best["label"],
        "explanation": explanation,
    }


def run_simulation(scenario_type: str, profile: FinancialProfile, investments, loans, goals, params: Dict) -> Dict:
    handler = SCENARIO_HANDLERS.get(scenario_type)
    if not handler:
        raise ValueError(f"Unsupported scenario type: {scenario_type}")
    return handler(profile, investments, loans, goals, params)
