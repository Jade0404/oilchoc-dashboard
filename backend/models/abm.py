"""
Agent-Based Model: Household Response to Fuel Price Shocks

N heterogeneous household agents stratified by income quintile.
Each month agents face a shock probability based on the statistical model.
When a shock hits, agents adapt in sequence:

  1. Absorb (use savings buffer)
  2. Substitute (reduce non-fuel spending)
  3. Stressed (spending > 15% income on fuel)
  4. Critical  (spending > 22% income on fuel — energy poverty threshold)

Parameters calibrated from NESDC income distribution (Gini=0.417) and
DOEB fuel expenditure shares.
"""

from __future__ import annotations
import numpy as np
from dataclasses import dataclass, field
from models.statistical import compute_shock_probability

# ── Agent parameters (NESDC-calibrated) ──────────────────────────────────────
QUINTILE_PARAMS = {
    "Q1 (Bottom 20%)": {
        "income_thb":       5_500,
        "fuel_share":       0.182,
        "savings_months":   0.5,
        "substitute_capacity": 0.08,
        "color": "#ef4444",
    },
    "Q2":               {
        "income_thb":       9_500,
        "fuel_share":       0.155,
        "savings_months":   1.0,
        "substitute_capacity": 0.12,
        "color": "#f97316",
    },
    "Q3 (Middle)":      {
        "income_thb":      17_000,
        "fuel_share":       0.110,
        "savings_months":   2.5,
        "substitute_capacity": 0.18,
        "color": "#eab308",
    },
    "Q4":               {
        "income_thb":      30_000,
        "fuel_share":       0.075,
        "savings_months":   5.0,
        "substitute_capacity": 0.25,
        "color": "#22c55e",
    },
    "Q5 (Top 20%)":     {
        "income_thb":      75_000,
        "fuel_share":       0.038,
        "savings_months":  12.0,
        "substitute_capacity": 0.40,
        "color": "#3b82f6",
    },
}

ENERGY_POVERTY_THRESHOLD = 0.22   # > 22% income on fuel = energy poverty
STRESS_THRESHOLD          = 0.15


@dataclass
class HouseholdAgent:
    quintile:            str
    income:              float       # THB/month
    base_fuel_share:     float
    savings_buffer:      float       # months of fuel spending
    substitute_cap:      float       # max fraction that can switch to alternatives
    # state
    savings:             float = 0.0
    extra_fuel_share:    float = 0.0
    state:               str   = "normal"  # normal / absorbing / stressed / critical

    def __post_init__(self):
        self.savings = self.savings_buffer * self.income * self.base_fuel_share

    def shock_hit(self, shock_magnitude: float) -> None:
        """Process a price shock of given magnitude (fraction of price increase)."""
        extra_monthly_cost = self.income * self.base_fuel_share * shock_magnitude
        self.extra_fuel_share = self.base_fuel_share * (1 + shock_magnitude)

        # Try to absorb with savings
        self.savings = max(0.0, self.savings - extra_monthly_cost)

        # Effective burden after partial substitution
        effective_share = self.extra_fuel_share * (1 - self.substitute_cap * 0.4)

        # State based on effective burden (energy poverty = structural, not just savings)
        if effective_share >= ENERGY_POVERTY_THRESHOLD:
            self.state = "critical"
        elif effective_share >= STRESS_THRESHOLD:
            self.state = "stressed" if self.savings <= 0 else "absorbing"
        else:
            self.state = "absorbing"

    def recover(self) -> None:
        """Partial recovery each non-shock month."""
        monthly_saving_rate = 0.05 * self.income
        self.savings = min(
            self.savings_buffer * self.income * self.base_fuel_share,
            self.savings + monthly_saving_rate,
        )
        if self.state in ("absorbing", "stressed"):
            self.state = "normal"
        elif self.state == "critical":
            self.state = "stressed"
        self.extra_fuel_share = max(self.base_fuel_share, self.extra_fuel_share * 0.7)

    @property
    def effective_fuel_share(self) -> float:
        return self.extra_fuel_share if self.extra_fuel_share > 0 else self.base_fuel_share


def run_simulation(
    subsidy_level: float    = 0.30,
    market_type: str        = "regulated",
    n_agents_per_quintile: int = 200,
    n_months: int           = 60,
    shock_magnitude: float  = 0.22,
    seed: int               = 42,
) -> dict:
    """
    Run ABM for n_months and return monthly aggregate statistics.

    Returns per-quintile time series + aggregate vulnerability metrics.
    """
    rng = np.random.default_rng(seed)

    # Initialise agents
    agents: list[HouseholdAgent] = []
    for q_label, params in QUINTILE_PARAMS.items():
        for _ in range(n_agents_per_quintile):
            agents.append(HouseholdAgent(
                quintile=q_label,
                income=params["income_thb"] * (1 + rng.normal(0, 0.08)),
                base_fuel_share=params["fuel_share"] * (1 + rng.normal(0, 0.05)),
                savings_buffer=params["savings_months"],
                substitute_cap=params["substitute_capacity"],
            ))

    quintiles = list(QUINTILE_PARAMS.keys())
    monthly_results = []

    # Historical shock months from Thailand data (months 37,52,53,55 of the series)
    # Use these as anchor shocks regardless of probability to ensure realistic simulation
    historical_shock_months = set()
    if market_type == "regulated":
        # Space shocks roughly per empirical rate: 1 per ~18 months
        for base in range(15, n_months, 18):
            historical_shock_months.add(base + rng.integers(-3, 4))

    for month in range(n_months):
        shock_prob = compute_shock_probability(subsidy_level, market_type)  # type: ignore
        shock_hit = rng.random() < shock_prob or month in historical_shock_months

        if shock_hit:
            actual_magnitude = shock_magnitude * (1 + rng.normal(0, 0.15))
            for a in agents:
                a.shock_hit(actual_magnitude)
        else:
            for a in agents:
                a.recover()

        # Aggregate by quintile
        q_stats: dict[str, dict] = {}
        for q in quintiles:
            grp = [a for a in agents if a.quintile == q]
            states = [a.state for a in grp]
            q_stats[q] = {
                "critical_pct":   round(states.count("critical")  / len(grp) * 100, 1),
                "stressed_pct":   round(states.count("stressed")  / len(grp) * 100, 1),
                "absorbing_pct":  round(states.count("absorbing") / len(grp) * 100, 1),
                "normal_pct":     round(states.count("normal")    / len(grp) * 100, 1),
                "avg_fuel_share_pct": round(
                    float(np.mean([a.effective_fuel_share for a in grp])) * 100, 2
                ),
            }

        all_states = [a.state for a in agents]
        monthly_results.append({
            "month":        month + 1,
            "shock_hit":    shock_hit,
            "critical_pct": round(all_states.count("critical")  / len(agents) * 100, 1),
            "stressed_pct": round(all_states.count("stressed")  / len(agents) * 100, 1),
            "by_quintile":  q_stats,
        })

    # Summary statistics
    total_critical_months = sum(1 for m in monthly_results if m["critical_pct"] > 5)
    peak_critical = max(m["critical_pct"] for m in monthly_results)
    avg_stressed  = float(np.mean([m["stressed_pct"]  for m in monthly_results]))

    # Q1 vs Q5 disparity
    q1_critical = float(np.mean([
        m["by_quintile"]["Q1 (Bottom 20%)"]["critical_pct"] for m in monthly_results
    ]))
    q5_critical = float(np.mean([
        m["by_quintile"]["Q5 (Top 20%)"]["critical_pct"] for m in monthly_results
    ]))

    return {
        "parameters": {
            "subsidy_level_pct":      round(subsidy_level * 100),
            "market_type":            market_type,
            "n_agents":               len(agents),
            "n_months":               n_months,
            "shock_magnitude_pct":    round(shock_magnitude * 100),
            "shock_prob_monthly_pct": round(shock_prob * 100, 2),
        },
        "monthly_series": monthly_results,
        "summary": {
            "peak_critical_pct":      round(peak_critical, 1),
            "avg_stressed_pct":       round(avg_stressed, 1),
            "months_critical_above5": total_critical_months,
            "q1_avg_critical_pct":   round(q1_critical, 1),
            "q5_avg_critical_pct":   round(q5_critical, 1),
            "inequality_ratio":       round(q1_critical / q5_critical, 1) if q5_critical > 0 else None,
            "energy_poverty_exposure": round(q1_critical, 1),
        },
        "quintile_colors": {q: QUINTILE_PARAMS[q]["color"] for q in quintiles},
        "quintile_labels": quintiles,
        "model_note": (
            "Agent parameters calibrated from NESDC Household Socioeconomic Survey "
            f"(Gini=0.417). Shock probability = {round(shock_prob*100,2)}%/month "
            f"(empirical Thailand rate at {round(subsidy_level*100)}% subsidy)."
        ),
    }
