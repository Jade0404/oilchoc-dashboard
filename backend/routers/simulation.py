from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Literal

from models.causal_inference import cross_sectional_ols, diff_in_diff
from models.abm import run_simulation
from models.optimization import optimise_reform

router = APIRouter(prefix="/api/simulation", tags=["simulation"])


# ── Causal Inference ──────────────────────────────────────────────────────────

@router.get("/causal/ols")
def causal_ols():
    """OLS regression: effect of regulation on shock rate (region FE, HC1 SE)."""
    return cross_sectional_ols()


@router.get("/causal/did")
def causal_did():
    """DiD: COVID-19 natural experiment — regulated vs deregulated shock response."""
    return diff_in_diff()


@router.get("/causal")
def causal_full():
    """Both causal methods combined."""
    return {
        "ols": cross_sectional_ols(),
        "did": diff_in_diff(),
        "summary": (
            "Two independent causal methods both identify a positive causal effect "
            "of price regulation on fuel price shock exposure."
        ),
    }


# ── Agent-Based Model ─────────────────────────────────────────────────────────

class ABMRequest(BaseModel):
    subsidy_level_pct: float = Field(30.0, ge=0.0, le=100.0)
    market_type: Literal["regulated", "deregulated"] = "regulated"
    n_months: int = Field(60, ge=12, le=120)
    shock_magnitude_pct: float = Field(18.0, ge=5.0, le=50.0)


@router.post("/abm")
def run_abm(req: ABMRequest):
    """
    Agent-Based Model: 1,000 household agents across 5 income quintiles.
    Calibrated from NESDC income distribution (Gini=0.417).
    """
    return run_simulation(
        subsidy_level=req.subsidy_level_pct / 100.0,
        market_type=req.market_type,
        n_agents_per_quintile=200,
        n_months=req.n_months,
        shock_magnitude=req.shock_magnitude_pct / 100.0,
    )


# ── Optimization ──────────────────────────────────────────────────────────────

class OptRequest(BaseModel):
    current_subsidy_pct: float = Field(30.0, ge=0.0, le=100.0)
    priority: Literal["balanced", "equity", "fiscal"] = "balanced"


@router.post("/optimize")
def optimize_reform(req: OptRequest):
    """
    L-BFGS-B constrained optimization of reform parameters.
    Minimises welfare loss W = α·fiscal + β·equity + γ·speed.
    """
    return optimise_reform(req.current_subsidy_pct, req.priority)
