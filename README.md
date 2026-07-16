# FinTwin AI — Financial Digital Twin

A full-stack fintech web app that builds an AI-powered **financial digital twin** of the user
and lets them simulate major life decisions (buying a home, switching jobs, retiring early,
starting a business, and more) before making them in real life.

This is **Core v1** — a fully working foundation. See "What's next" at the bottom for the
features planned in follow-up passes (PDF/Excel export, onboarding wizard, Reports page, etc).

---

## Tech Stack

**Frontend:** React (Vite) + TypeScript + Tailwind CSS + Framer Motion + Recharts + React Router + Axios + Lucide Icons
**Backend:** Python 3.11+ + FastAPI + SQLAlchemy + SQLite + JWT Auth + Pydantic
**AI:** Rule-based explainable engine by default; optional OpenAI or Gemini integration via env vars

No Docker, no Java, no microservices — everything runs locally with two commands.

---

## Project Structure

```
fintwin-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entrypoint
│   │   ├── config.py            # Settings from .env
│   │   ├── database.py          # SQLAlchemy engine/session
│   │   ├── models.py            # ORM models (10 tables)
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── auth.py              # JWT + password hashing
│   │   ├── routers/             # API endpoints, one file per resource
│   │   └── services/            # Core logic: calculations, predictions, scenarios, AI advisor
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/                # 13 pages (Landing, Auth, Dashboard, etc.)
    │   ├── components/
    │   │   ├── layout/           # Sidebar, Navbar, AppLayout
    │   │   └── ui/                # Reusable Button, InputField, GlassCard, StatCard
    │   ├── context/              # AuthContext, ThemeContext
    │   ├── services/             # Axios API client + per-resource calls
    │   └── types/                 # Shared TypeScript interfaces
    ├── package.json
    └── tailwind.config.js
```

---

## Setup & Run

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit .env if you have an OpenAI/Gemini key
uvicorn app.main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.
A `fintwin.db` SQLite file is created automatically on first run — no migrations needed.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be live at `http://localhost:5173`.

> Open the frontend first, click **Get Started**, register an account, then go to
> **Digital Twin** to enter your financial profile — every other page (Dashboard,
> Scenario Simulator, Predictions, Health Score, AI Advisor) depends on that profile existing.

---

## Enabling the LLM-powered AI Advisor

By default `AI_PROVIDER` is empty in `.env`, so the AI Advisor uses a transparent,
rule-based engine — no API key required, and it always works.

To use a real LLM instead, edit `backend/.env`:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

or

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=...
```

If the API call fails for any reason, the backend automatically falls back to the
rule-based engine so the feature never breaks.

---

## Core Features Implemented in v1

1. **AI Financial Digital Twin** — enter income, expenses, savings, investments, loans,
   insurance, and goals; auto-calculates net worth, cash flow, savings/debt ratios, and more.
2. **Scenario Simulator** — buy a home, buy a car, switch jobs, retire, start a business,
   take a vacation, pursue higher education, or get married — each generates 2-3 comparable
   scenarios with projected outcomes and an AI-picked recommendation.
3. **AI Financial Advisor** — chat-style Q&A that returns a recommendation, reasoning,
   advantages, risks, an alternative, and a confidence score, personalized to your data.
4. **Predictive Analytics** — forecasts net worth, savings, and investments for 1/5/10/20/30
   year horizons using compound growth modeling.
5. **Financial Health Score** — 0-100 score with a circular gauge, breakdown bars, insights,
   and recommendations.
6. **Goals & Investments/Loans tracking** — full CRUD with progress bars.
7. **Dashboard** — aggregates everything above into one premium, animated view.
8. **Dark/Light mode, glassmorphism, gradient backgrounds, animated cards** throughout.

---

## What's Next (Follow-up Passes)

- Onboarding wizard, Reports page, Settings page expansion
- CSV / Excel / PDF export of reports
- Full asset tracking (property, vehicles, gold) integrated into net worth
- Transaction-level tracking and categorized spending charts
- More scenario types and richer ML-based predictions (scikit-learn regression models)
- Notifications, search, and filtering across the app

---

## Notes

- This was generated and syntax-validated in a sandboxed environment without internet
  access, so `npm install` / `pip install` and a live run have **not** been executed here.
  Double-check `npm run dev` and `uvicorn app.main:app --reload` locally — if you hit a
  dependency version conflict, relax the pinned version in `requirements.txt` /
  `package.json` for that package.
- Default sample currency formatting is INR (₹) since EMI-based loan calculations assume an
  Indian lending context — change `formatINR` and default param values in the frontend if you
  need a different currency.
