from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Literal

from models.statistical import (
    compute_shock_probability,
    compute_income_impacts,
    sweep_shock_curve,
    THAILAND_SHOCK_RATE,
    THAILAND_PERCENTILE,
    OBSERVATION_MONTHS,
    OBSERVED_RATIO,
    MANN_WHITNEY_P,
)

router = APIRouter(prefix="/api/stress-test", tags=["stress-tester"])


class StressTestRequest(BaseModel):
    subsidy_level: float = Field(0.3, ge=0.0, le=1.0)
    market_type: Literal["regulated", "deregulated"] = "regulated"


@router.post("")
def stress_test(req: StressTestRequest):
    shock_prob = compute_shock_probability(req.subsidy_level, req.market_type)
    annual = 1.0 - (1.0 - shock_prob) ** 12
    income_impacts = compute_income_impacts(shock_prob)
    sweep = sweep_shock_curve(req.market_type)

    return {
        "monthly_shock_prob": round(shock_prob * 100, 2),
        "annual_shock_prob":  round(annual * 100, 1),
        "kurtosis_note":      "Malaysia (regulated) excess kurtosis = 29.5 vs Germany = 10.4",
        "by_income_group":    income_impacts,
        "sweep_curve":        sweep,
        "thailand_reference": {
            "monthly_shock_rate_pct":  round(THAILAND_SHOCK_RATE * 100, 2),
            "observation_months":      OBSERVATION_MONTHS,
            "percentile_of_regulated": THAILAND_PERCENTILE,
            "shock_ratio_observed":    OBSERVED_RATIO,
            "mann_whitney_p":          MANN_WHITNEY_P,
        },
    }
