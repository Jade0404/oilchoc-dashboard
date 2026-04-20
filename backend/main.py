from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.stress_tester import router as stress_router
from routers.reform_optimizer import router as reform_router
from routers.evidence import router as evidence_router

app = FastAPI(
    title="Subsidy Volatility Paradox API",
    description=(
        "Statistical proof and policy simulation for the Subsidy Volatility Paradox. "
        "Methods: Mann-Whitney U, KS 2-sample, Excess Kurtosis, Bootstrap CI."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stress_router)
app.include_router(reform_router)
app.include_router(evidence_router)


@app.get("/api/thailand-stats")
def thailand_stats():
    """Thailand case study — numbers from real data (country_vol.csv + diesel_timeseries.csv)."""
    from data_loader import load_country_vol, load_timeseries
    from models.statistical import (
        THAILAND_SHOCK_RATE, THAILAND_PERCENTILE,
        OBSERVED_RATIO, MANN_WHITNEY_P, GINI_COEFFICIENT,
        POVERTY_RATE_PCT, INCOME_RATIO_TOP_BOTTOM,
    )
    ts = load_timeseries()
    tha_shocks = [
        s for s in ts.get("Thailand", [])
        if s.get("mom_pct") is not None and abs(s["mom_pct"]) > 0.10
    ]
    return {
        "country": "Thailand",
        "iso3": "THA",
        "observation_months": len(ts.get("Thailand", [])),
        "shock_events": len(tha_shocks),
        "shock_dates": [s["date"] for s in tha_shocks],
        "monthly_shock_rate_pct": round(THAILAND_SHOCK_RATE * 100, 2),
        "percentile_of_regulated": THAILAND_PERCENTILE,
        "observed_shock_ratio_reg_vs_dereg": OBSERVED_RATIO,
        "mann_whitney_p": MANN_WHITNEY_P,
        "nesdc": {
            "gini_income": GINI_COEFFICIENT,
            "poverty_rate_pct_2566": POVERTY_RATE_PCT,
            "income_ratio_top20_bottom20": INCOME_RATIO_TOP_BOTTOM,
        },
        "dataset": {
            "countries_total": 207,
            "countries_with_data": 235,
            "period": "Dec 2015 – Apr 2025",
            "sources": [
                "World Bank Global Fuel Prices Database",
                "NESDC Household Socioeconomic Survey",
                "DOEB Provincial Fuel Consumption",
            ],
        },
    }


@app.get("/health")
def health():
    return {"status": "ok"}
