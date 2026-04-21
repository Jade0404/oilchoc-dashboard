"""
Reform Path Optimization using scipy.optimize

Minimises welfare loss W(duration, cash_fraction) with genuine trade-offs:
  - Fiscal priority: short duration, minimal cash admin cost
  - Equity priority:  long duration (gradual = less shock per month) + high cash
  - Balanced:         Pareto-efficient point between the two

x = [duration_months, cash_transfer_fraction]
Targeting accuracy fixed at 0.82 (realistic programme implementation)
"""

from __future__ import annotations
import numpy as np
from scipy.optimize import minimize, OptimizeResult
from models.statistical import compute_shock_probability, compute_income_impacts

TARGETING_ACC = 0.82   # fixed — realistic NGO/government targeting efficiency


def welfare_loss(
    x: np.ndarray,
    current_subsidy: float,
    w_fiscal: float,
    w_equity: float,
    w_speed: float,
    subsidy_monthly_bn: float = 0.8,
) -> float:
    duration      = float(np.clip(x[0], 12, 60))
    cash_fraction = float(np.clip(x[1], 0.0,  1.0))

    cum_fiscal = 0.0
    cum_equity = 0.0

    for month in range(1, int(duration) + 1):
        # Remaining subsidy this month
        remaining  = max(0.0, current_subsidy * (1.0 - month / duration))

        # Shock probability for this month's subsidy level
        shock_prob = compute_shock_probability(remaining, "regulated")

        # Fiscal: subsidy still being paid + cash admin overhead
        cash_admin = cash_fraction * current_subsidy * 0.28 * subsidy_monthly_bn
        cum_fiscal += remaining * subsidy_monthly_bn + cash_admin

        # Equity: residual low-income shock exposure
        # Cash transfer offsets max 65% of shock impact → cannot fully eliminate
        # equity concern regardless of cash level
        low_exposure   = compute_income_impacts(shock_prob)["low"]["shock_prob"]
        cash_offset    = cash_fraction * TARGETING_ACC * 0.65
        residual       = low_exposure * (1.0 - cash_offset)
        cum_equity    += residual

    # Normalise to [0, 1] range
    baseline_fiscal = current_subsidy * subsidy_monthly_bn * 60
    fiscal_norm     = cum_fiscal / baseline_fiscal

    baseline_equity = 60 * 0.18   # 60 months × max 18% low-income shock exposure
    equity_norm     = cum_equity / baseline_equity

    # Speed: penalty for long duration (equity prefers long, fiscal prefers short)
    speed_penalty   = (duration - 12.0) / 48.0   # 0 at 12m → 1 at 60m

    return w_fiscal * fiscal_norm + w_equity * (equity_norm - speed_penalty * 0.3) + w_speed * speed_penalty


def optimise_reform(
    current_subsidy_pct: float = 30.0,
    priority: str = "balanced",
) -> dict:
    current = current_subsidy_pct / 100.0

    # Weights that produce genuinely different optima
    # fiscal  → short duration + low cash (minimize fiscal_norm + speed_penalty)
    # equity  → long duration + high cash (minimize equity_norm, accept speed_penalty)
    # balanced → intermediate
    weight_sets = {
        "fiscal":   {"w_fiscal": 0.75, "w_equity": 0.10, "w_speed": 0.15},
        "balanced": {"w_fiscal": 0.20, "w_equity": 0.60, "w_speed": 0.20},
        "equity":   {"w_fiscal": 0.08, "w_equity": 0.82, "w_speed": 0.10},
    }
    weights = weight_sets.get(priority, weight_sets["balanced"])

    x0     = np.array([24.0, 0.5])
    bounds = [(12, 60), (0.0, 1.0)]

    result: OptimizeResult = minimize(
        welfare_loss,
        x0,
        args=(current, weights["w_fiscal"], weights["w_equity"], weights["w_speed"]),
        method="L-BFGS-B",
        bounds=bounds,
        options={"ftol": 1e-12, "gtol": 1e-8, "maxiter": 1000},
    )

    opt_duration  = int(round(float(result.x[0])))
    opt_cash_frac = round(float(result.x[1]), 3)
    opt_loss      = float(result.fun)

    # Compare against fixed benchmark paths
    benchmarks = {}
    for name, dur, cf in [("fast_cut", 12, 0.0), ("gradual", 48, 0.0), ("cash_transfer", 24, 0.8)]:
        loss = welfare_loss(
            np.array([float(dur), cf]), current,
            weights["w_fiscal"], weights["w_equity"], weights["w_speed"],
        )
        benchmarks[name] = {
            "duration_months":    dur,
            "cash_fraction":      cf,
            "welfare_loss":       round(loss, 6),
            "improvement_vs_optimal_pct": round((loss - opt_loss) / max(loss, 1e-9) * 100, 1),
        }

    # Optimal timeline
    timeline = []
    for month in range(1, opt_duration + 1):
        remaining  = max(0.0, current * (1.0 - month / opt_duration))
        shock_prob = compute_shock_probability(remaining, "regulated")
        impacts    = compute_income_impacts(shock_prob)
        timeline.append({
            "month":          month,
            "subsidy_pct":    round(remaining * 100, 1),
            "shock_prob_pct": round(shock_prob * 100, 2),
            "low_cost_usd":   impacts["low"]["monthly_cost_impact_usd"],
        })

    return {
        "method":   "L-BFGS-B Constrained Optimization",
        "objective":"W = α·fiscal + β·equity_exposure + γ·speed_penalty",
        "priority": priority,
        "weights":  weights,
        "optimal_solution": {
            "duration_months":        opt_duration,
            "cash_transfer_fraction": opt_cash_frac,
            "targeting_accuracy":     TARGETING_ACC,
            "welfare_loss_value":     round(opt_loss, 6),
            "optimizer_converged":    bool(result.success),
            "iterations":             int(result.nit),
        },
        "vs_fixed_paths": benchmarks,
        "optimal_timeline": timeline,
        "interpretation": (
            f"Under '{priority}' priority, optimal reform: "
            f"{opt_duration} months, {round(opt_cash_frac*100)}% cash-transfer replacement "
            f"(targeting {round(TARGETING_ACC*100)}%). "
            f"Welfare loss = {round(opt_loss, 4)}."
        ),
    }
