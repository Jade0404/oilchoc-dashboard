"""
Reform Path Optimization using scipy.optimize

Minimises a welfare loss function W(x) over reform parameters:
  x = [duration_months, cash_transfer_fraction, targeting_accuracy]

Welfare loss W = α·fiscal_cost + β·vulnerability_exposure + γ·transition_speed_penalty

Weights (α, β, γ) reflect policy priorities:
  - equity-first: β↑   → protects low-income households
  - fiscal-first: α↑   → maximise government savings
  - speed-first:  γ↑   → minimise transition period
"""

from __future__ import annotations
import numpy as np
from scipy.optimize import minimize, OptimizeResult
from models.statistical import compute_shock_probability, compute_income_impacts


# ── Welfare loss function ─────────────────────────────────────────────────────

def welfare_loss(
    x: np.ndarray,
    current_subsidy: float,
    w_fiscal: float,
    w_equity: float,
    w_speed: float,
    subsidy_monthly_bn: float = 0.8,
) -> float:
    duration          = float(np.clip(x[0], 6, 72))
    cash_fraction     = float(np.clip(x[1], 0.0, 1.0))
    targeting_acc     = float(np.clip(x[2], 0.5, 1.0))

    fiscal_loss = 0.0
    equity_loss = 0.0

    for month in range(1, int(duration) + 1):
        remaining = max(0.0, current_subsidy * (1 - month / duration))
        # Cash transfer offsets effective subsidy removal for protected households
        effective = remaining * (1 - cash_fraction * targeting_acc * 0.6)
        shock_prob = compute_shock_probability(effective, "regulated")
        impacts    = compute_income_impacts(shock_prob)

        # Fiscal: cost of subsidy still paid + cash transfer overhead
        fiscal_loss += (remaining * subsidy_monthly_bn) + (
            cash_fraction * current_subsidy * 0.25 * subsidy_monthly_bn
        )
        # Equity: weighted vulnerability of low-income group
        equity_loss += impacts["low"]["shock_prob"] * (1 - targeting_acc)

    speed_penalty = duration / 72.0   # normalised to [0,1]
    fiscal_norm   = fiscal_loss / (current_subsidy * subsidy_monthly_bn * 72)
    equity_norm   = equity_loss / duration

    return w_fiscal * fiscal_norm + w_equity * equity_norm + w_speed * speed_penalty


# ── Optimise ──────────────────────────────────────────────────────────────────

def optimise_reform(
    current_subsidy_pct: float = 30.0,
    priority: str = "balanced",
) -> dict:
    """
    Find optimal reform parameters under three policy priority scenarios.

    priority: 'balanced' | 'equity' | 'fiscal'
    """
    current = current_subsidy_pct / 100.0

    weight_sets = {
        "balanced": {"w_fiscal": 0.35, "w_equity": 0.45, "w_speed": 0.20},
        "equity":   {"w_fiscal": 0.15, "w_equity": 0.70, "w_speed": 0.15},
        "fiscal":   {"w_fiscal": 0.65, "w_equity": 0.20, "w_speed": 0.15},
    }
    weights = weight_sets.get(priority, weight_sets["balanced"])

    # x = [duration_months, cash_transfer_fraction, targeting_accuracy]
    x0     = np.array([24.0, 0.5, 0.8])
    bounds = [(12, 60), (0.0, 1.0), (0.6, 0.99)]

    result: OptimizeResult = minimize(
        welfare_loss,
        x0,
        args=(current, weights["w_fiscal"], weights["w_equity"], weights["w_speed"]),
        method="L-BFGS-B",
        bounds=bounds,
        options={"ftol": 1e-9, "maxiter": 500},
    )

    opt_duration    = round(float(result.x[0]))
    opt_cash_frac   = round(float(result.x[1]), 3)
    opt_targeting   = round(float(result.x[2]), 3)
    opt_loss        = float(result.fun)

    # Compare to three fixed reform paths
    benchmarks = {}
    for name, dur, cf, ta in [
        ("fast_cut",       12, 0.0, 0.8),
        ("gradual",        48, 0.0, 0.8),
        ("cash_transfer",  24, 0.8, 0.85),
    ]:
        x_bench = np.array([float(dur), cf, ta])
        loss = welfare_loss(x_bench, current, weights["w_fiscal"], weights["w_equity"], weights["w_speed"])
        benchmarks[name] = {
            "duration_months":    dur,
            "cash_fraction":      cf,
            "targeting_accuracy": ta,
            "welfare_loss":       round(loss, 6),
            "improvement_vs_optimal_pct": round((loss - opt_loss) / loss * 100, 1),
        }

    # Build optimal timeline
    timeline = []
    for month in range(1, opt_duration + 1):
        remaining  = max(0.0, current * (1 - month / opt_duration))
        effective  = remaining * (1 - opt_cash_frac * opt_targeting * 0.6)
        shock_prob = compute_shock_probability(effective, "regulated")
        impacts    = compute_income_impacts(shock_prob)
        timeline.append({
            "month":          month,
            "subsidy_pct":    round(remaining * 100, 1),
            "shock_prob_pct": round(shock_prob * 100, 2),
            "low_cost_usd":   impacts["low"]["monthly_cost_impact_usd"],
        })

    return {
        "method": "L-BFGS-B Constrained Optimization (scipy.optimize.minimize)",
        "objective": "Minimise W = α·fiscal_cost + β·vulnerability_exposure + γ·speed_penalty",
        "priority": priority,
        "weights": weights,
        "optimal_solution": {
            "duration_months":        opt_duration,
            "cash_transfer_fraction": opt_cash_frac,
            "targeting_accuracy":     opt_targeting,
            "welfare_loss_value":     round(opt_loss, 6),
            "optimizer_converged":    bool(result.success),
            "iterations":             int(result.nit),
        },
        "vs_fixed_paths": benchmarks,
        "optimal_timeline": timeline,
        "sensitivity": {
            "note": "Run with priority='equity' or 'fiscal' for alternative optima.",
            "equity_shifts":  "Higher cash_transfer_fraction, longer duration",
            "fiscal_shifts":  "Shorter duration, lower cash_transfer_fraction",
        },
        "interpretation": (
            f"Under '{priority}' priority weights, the optimal reform uses "
            f"{opt_duration} months, {round(opt_cash_frac*100)}% cash-transfer replacement, "
            f"and {round(opt_targeting*100)}% targeting accuracy. "
            f"This achieves welfare loss {round(opt_loss,4)} vs "
            f"best fixed path {round(min(b['welfare_loss'] for b in benchmarks.values()),4)}."
        ),
    }
