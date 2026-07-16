"""
AI Financial Advisor service.

If AI_PROVIDER is set (openai/gemini) and an API key is present, the advisor
calls the LLM with the user's financial profile injected as context, asking
for a structured JSON response. Otherwise it falls back to a transparent
rule-based engine so the app always works without any API key.
"""
import json
import re
from typing import Dict

import httpx

from app.config import settings
from app.models import FinancialProfile
from app.services.calculations import calculate_financial_health_score


SYSTEM_PROMPT = """You are FinTwin AI, a personal financial advisor embedded in a financial \
digital twin application. You will be given a user's financial profile and a question. \
Respond ONLY with a valid JSON object (no markdown, no preamble) with these exact keys: \
recommendation (string, one or two sentences), reason (string, 2-4 sentences explaining why), \
advantages (array of short strings), risks (array of short strings), \
alternative (string, one alternative course of action), \
confidence_score (number between 0 and 100)."""


def _build_user_context(profile: FinancialProfile, health: Dict) -> str:
    return (
        f"Age: {profile.age}, Monthly income: {profile.monthly_income}, "
        f"Monthly expenses: {profile.monthly_expenses}, Savings: {profile.current_savings}, "
        f"Emergency fund: {profile.emergency_fund}, Total investments: {profile.total_investments}, "
        f"Total loans: {profile.total_loans}, Insurance cover: {profile.insurance_cover}, "
        f"Retirement age goal: {profile.retirement_age_goal}, Risk appetite: {profile.risk_appetite}, "
        f"Financial health score: {health['score']}/100, Savings ratio: {health['savings_ratio']}%, "
        f"Debt ratio: {health['debt_ratio']}%, Monthly cash flow: {health['cash_flow']}, "
        f"Emergency fund months: {health['emergency_fund_months']}."
    )


def _extract_json(text: str) -> Dict:
    """LLMs sometimes wrap JSON in markdown fences — strip and parse defensively."""
    cleaned = text.strip()
    cleaned = re.sub(r"^```(json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    return json.loads(cleaned)


async def _call_openai(question: str, context: str) -> Dict:
    headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"User financial profile: {context}\n\nQuestion: {question}"},
        ],
        "temperature": 0.4,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        text = data["choices"][0]["message"]["content"]
        return _extract_json(text)


async def _call_gemini(question: str, context: str) -> Dict:
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    )
    payload = {
        "contents": [{
            "parts": [{"text": f"{SYSTEM_PROMPT}\n\nUser financial profile: {context}\n\nQuestion: {question}"}]
        }]
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return _extract_json(text)


def _rule_based_advice(question: str, profile: FinancialProfile, health: Dict) -> Dict:
    q = question.lower()
    savings_ratio = health["savings_ratio"]
    debt_ratio = health["debt_ratio"]
    cash_flow = health["cash_flow"]
    emergency_months = health["emergency_fund_months"]

    # Big-ticket purchase style questions (car, BMW, expensive item)
    if any(word in q for word in ["buy", "purchase", "bmw", "car", "house", "home", "phone", "gadget"]):
        affordable = cash_flow > 0 and debt_ratio < 35 and emergency_months >= 3
        recommendation = (
            "This purchase looks affordable within your current financial plan."
            if affordable else
            "Consider delaying this purchase until your finances are more stable."
        )
        reason = (
            f"Your monthly cash flow is {'positive' if cash_flow > 0 else 'negative'} (₹{cash_flow:,.0f}), "
            f"your debt-to-income ratio is {debt_ratio}%, and you have {emergency_months} months of expenses "
            "in your emergency fund. "
        )
        reason += (
            "These are within healthy limits for a major purchase." if affordable else
            "These indicate limited room for additional EMI or large one-time spends right now."
        )
        advantages = ["Improves quality of life or utility", "May be cheaper to buy now if prices are rising"]
        risks = ["Reduces available emergency cushion", "Adds EMI burden if financed", "Opportunity cost of investing that capital instead"]
        alternative = "Save toward this goal for 6-12 months while keeping investments untouched, then reassess."
        confidence = 82 if affordable else 70

    elif any(word in q for word in ["sip", "invest", "mutual fund", "stock"]):
        recommendation = (
            "Increasing your SIP/investment contribution is advisable given your current savings ratio."
            if savings_ratio > 20 else
            "Focus on improving your savings ratio before increasing investment contributions."
        )
        reason = f"Your current savings ratio is {savings_ratio}%. "
        reason += (
            "You have surplus capacity to invest more for long-term compounding." if savings_ratio > 20 else
            "Increasing investments now could strain monthly cash flow."
        )
        advantages = ["Benefits from long-term compounding", "Builds toward retirement and major goals faster"]
        risks = ["Market volatility in the short term", "Reduces liquidity if over-committed"]
        alternative = "Increase SIP gradually by 10% every 6 months as income grows, rather than all at once."
        confidence = 85 if savings_ratio > 20 else 65

    elif "retire" in q:
        on_track = health["score"] >= 60 and savings_ratio >= 20
        recommendation = (
            "You appear on track to retire around your target age." if on_track else
            "Retiring early at this pace carries meaningful risk — adjustments are recommended."
        )
        reason = (
            f"Your financial health score is {health['score']}/100 with a savings ratio of {savings_ratio}%. "
        )
        reason += (
            "This trajectory supports your retirement goal." if on_track else
            "This trajectory may fall short of a comfortable retirement corpus."
        )
        advantages = ["Earlier retirement means more free time", "Forces disciplined saving habits"]
        risks = ["Underestimating healthcare and inflation costs", "Longer retirement period to fund without active income"]
        alternative = "Run the Retirement scenario simulator to compare retiring at different ages."
        confidence = 80 if on_track else 60

    elif any(word in q for word in ["job", "switch", "career"]):
        recommendation = "Evaluate the new offer using the Job Change scenario simulator for a precise comparison."
        reason = "Job changes affect income growth trajectory, benefits, and job security simultaneously."
        advantages = ["Potential salary increase", "New skills/growth opportunities"]
        risks = ["Probation period income gaps", "Loss of accrued benefits at current job"]
        alternative = "Negotiate a raise or role change internally before switching externally."
        confidence = 60

    else:
        recommendation = "Based on your current financial profile, proceed cautiously and review the relevant scenario simulation."
        reason = f"Your financial health score is {health['score']}/100 with a {debt_ratio}% debt ratio and {savings_ratio}% savings ratio."
        advantages = ["Informed decision-making using your real financial data"]
        risks = ["General advice may not capture every nuance of your situation"]
        alternative = "Use the Scenario Simulator for a more detailed, decision-specific projection."
        confidence = 55

    return {
        "recommendation": recommendation,
        "reason": reason,
        "advantages": advantages,
        "risks": risks,
        "alternative": alternative,
        "confidence_score": confidence,
    }


async def get_advice(question: str, profile: FinancialProfile, investments, loans, goals) -> Dict:
    health = calculate_financial_health_score(profile, investments, loans, goals)

    if settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        try:
            context = _build_user_context(profile, health)
            return await _call_openai(question, context)
        except Exception:
            pass  # fall through to rule-based on any API failure

    if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        try:
            context = _build_user_context(profile, health)
            return await _call_gemini(question, context)
        except Exception:
            pass

    return _rule_based_advice(question, profile, health)
