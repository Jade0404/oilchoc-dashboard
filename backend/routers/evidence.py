"""
/api/evidence  — Statistical proof and real-data visualisation endpoints.
"""

from fastapi import APIRouter
from models.stat_tests import full_statistical_defence
from data_loader import load_country_vol, load_timeseries, load_nesdc_table18, load_doeb

router = APIRouter(prefix="/api/evidence", tags=["evidence"])


@router.get("/statistical-defence")
def get_statistical_defence():
    """
    Full 4-method statistical defence:
      1. Mann-Whitney U Test
      2. KS 2-Sample Test
      3. Excess Kurtosis (fat-tail analysis)
      4. Bootstrap Confidence Interval (10,000 iterations)
    """
    return full_statistical_defence()


@router.get("/country-scatter")
def get_country_scatter():
    """
    Per-country scatter data: volatility (x) vs shock rate (y), coloured by group.
    Used to visualise the Paradox — regulated markets have similar volatility
    but significantly higher shock frequency.
    """
    cv = load_country_vol()
    seen: dict[str, dict] = {}
    for r in cv:
        key = r["code"]
        if key not in seen:
            seen[key] = dict(r)
        else:
            seen[key]["shock_rate"] = (seen[key]["shock_rate"] + r["shock_rate"]) / 2
            seen[key]["volatility"] = (seen[key]["volatility"] + r["volatility"]) / 2

    return [
        {
            "country":     v["country"],
            "code":        v["code"],
            "group":       v["group"],
            "region":      v["region"],
            "shock_pct":   round(v["shock_rate"] * 100, 2),
            "volatility_pct": round(v["volatility"] * 100, 2),
            "is_thailand": v["code"] == "THA",
        }
        for v in seen.values()
        if v["group"] in ("Regulated", "Deregulated")
    ]


@router.get("/price-timeline")
def get_price_timeline():
    """Diesel price time series for key countries with shock events flagged."""
    ts = load_timeseries()
    COUNTRIES = {
        "Thailand":      "Regulated",
        "Malaysia":      "Regulated",
        "Indonesia":     "Regulated",
        "Germany":       "Deregulated",
        "United States": "Deregulated",
    }
    result = {}
    for country, group in COUNTRIES.items():
        series = ts.get(country, [])
        result[country] = {
            "group": group,
            "series": [
                {
                    "date":     s["date"],
                    "price":    round(s["price"], 4),
                    "mom_pct":  round(s["mom_pct"] * 100, 2) if s["mom_pct"] is not None else None,
                    "is_shock": abs(s["mom_pct"]) > 0.10 if s["mom_pct"] is not None else False,
                }
                for s in series
            ],
            "n_shocks": sum(
                1 for s in series
                if s.get("mom_pct") is not None and abs(s["mom_pct"]) > 0.10
            ),
        }
    return result


@router.get("/income-vulnerability")
def get_income_vulnerability():
    """
    Thailand income inequality and fuel-expenditure data from NESDC + DOEB.
    Demonstrates regressive burden of fuel price shocks.
    """
    nesdc = load_nesdc_table18()
    doeb  = load_doeb()
    return {
        "nesdc": nesdc,
        "doeb":  doeb,
        "fuel_burden_by_group": {
            "low_income_share_pct":    14.8,
            "middle_income_share_pct": 8.8,
            "high_income_share_pct":   3.9,
            "source": "DOEB provincial fuel data + NESDC income quintile calibration",
        },
        "interpretation": (
            "A 15% fuel price shock costs low-income households "
            "~3.8× more as a share of income than high-income households, "
            "concentrated among the 4.89% of the population below the poverty line (2567)."
        ),
    }


@router.get("/summary")
def get_summary():
    """Lightweight banner stats — pre-computed for fast page load."""
    from models.stat_tests import mann_whitney_test, bootstrap_ci
    cv   = load_country_vol()
    mw   = mann_whitney_test(cv)
    boot = bootstrap_ci(cv)
    return {
        "shock_ratio":                 mw["descriptives"]["observed_ratio"],
        "shock_ratio_ci":              boot["result"]["ratio_ci_95"],
        "p_value_mann_whitney":        mw["result"]["p_value"],
        "p_value_ks":                  None,   # filled by /statistical-defence
        "n_countries":                 len(set(r["code"] for r in cv)),
        "n_regulated":                 mw["descriptives"]["n_regulated"],
        "n_deregulated":               mw["descriptives"]["n_deregulated"],
        "regulated_median_pct":        mw["descriptives"]["regulated_median_pct"],
        "deregulated_median_pct":      mw["descriptives"]["deregulated_median_pct"],
        "observation_months":          113,
        "period":                      "Dec 2015 – Apr 2025",
    }
