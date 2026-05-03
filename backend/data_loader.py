"""
Loads and preprocesses all CSV data files once at startup.
All paths are relative to the /data directory two levels above this file.
"""

import csv
import math
import statistics
from pathlib import Path
from functools import lru_cache

DATA_DIR = Path(__file__).parent / "data"


def _clean_num(v: str) -> float | None:
    try:
        return float(str(v).replace(",", "").strip())
    except (ValueError, AttributeError):
        return None


# ── country_vol.csv ──────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def load_country_vol() -> list[dict]:
    rows = []
    with open(DATA_DIR / "country_vol.csv") as f:
        for r in csv.DictReader(f):
            shock = _clean_num(r["big_jumps_pct"])
            vol   = _clean_num(r["volatility"])
            cv    = _clean_num(r["cv"])
            if shock is None or vol is None:
                continue
            rows.append({
                "country": r["Country"],
                "code": r["code"],
                "fuel": r["fuel"],
                "group": r["group"] if r["group"] in ("Regulated", "Deregulated") else "Other",
                "region": r["region"],
                "shock_rate": shock,
                "volatility": vol,
                "cv": cv,
                "n_months": int(r["n_months"]) if r["n_months"] else 0,
            })
    return rows


# ── diesel_timeseries.csv ────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def load_timeseries() -> dict[str, list[dict]]:
    """Returns dict: country → list of {date, price, mom_pct_change}"""
    with open(DATA_DIR / "diesel_timeseries.csv") as f:
        raw = list(csv.DictReader(f))

    countries = [k for k in raw[0].keys() if k != "date"]
    result: dict[str, list[dict]] = {}

    for country in countries:
        series = [
            {"date": r["date"], "price": float(r[country])}
            for r in raw
            if r.get(country, "").strip()
        ]
        for i in range(len(series)):
            if i == 0:
                series[i]["mom_pct"] = None
            else:
                prev = series[i - 1]["price"]
                series[i]["mom_pct"] = (series[i]["price"] - prev) / prev if prev else None
        result[country] = series

    return result


# ── NESDC poverty / income distribution ─────────────────────────────────────

@lru_cache(maxsize=1)
def load_nesdc_table18() -> dict:
    """
    Returns key indicators (latest available year) from NESDC Table 1.8.
    Source: NESDC Household Socioeconomic Survey, processed by NESDC Social
    Development Data and Indicators Division.
    """
    path = DATA_DIR / "สถิติความยากจนและการกระจายรายได้_260205 - 1.8.csv"
    with open(path, encoding="utf-8-sig") as f:
        rows = list(csv.reader(f))

    # Find header row (years)
    header = None
    data: dict[str, dict] = {}
    for r in rows:
        label = r[0].strip()
        if label in ("ตัวชี้วัด", " ตัวชี้วัด"):
            header = [v.strip() for v in r]
        elif header and any(v.strip() for v in r[1:]):
            vals = {}
            for i, v in enumerate(r):
                if i < len(header) and header[i] and v.strip() and v.strip() != "na.":
                    try:
                        vals[header[i]] = float(v.strip().replace(",", ""))
                    except ValueError:
                        pass
            if vals:
                data[label] = vals

    def latest(key_fragment: str) -> tuple[str, float] | None:
        for k, v in data.items():
            if key_fragment in k:
                # get most recent year with value
                for yr in reversed(["2564", "2565", "2566", "2567"]):
                    if yr in v:
                        return yr, v[yr]
        return None

    gini_income  = latest("Gini coefficient) ของรายได้")
    poverty_rate = latest("สัดส่วนคนจน (ร้อยละ)")
    income_ratio = latest("กลุ่มรวยสุด 20%")

    return {
        "gini_income":   {"year": gini_income[0],  "value": gini_income[1]}  if gini_income  else None,
        "poverty_rate":  {"year": poverty_rate[0], "value": poverty_rate[1]} if poverty_rate else None,
        "income_ratio_top20_bottom20": {
            "year": income_ratio[0], "value": income_ratio[1]
        } if income_ratio else None,
        "source": "NESDC Household Socioeconomic Survey (สำนักงานสถิติแห่งชาติ / สศช.)",
    }


# ── DOEB fuel consumption ────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def load_doeb() -> dict:
    """Aggregate household + transport fuel consumption from DOEB."""
    hh_cols   = ["LPG","Low Speed Diesel (LSD)","High Speed Diesel (HSD)/Biodiesel",
                 "Gasoline 91","Gasoline 95","Gasohol 91","Gasohol 95"]
    tr_cols   = hh_cols + ["Fuel oil","Natural gas"]

    def agg(path, cols, year_col="BE_Year", prov_col="Province "):
        totals: dict[str, float] = {}
        with open(path, encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                yr  = r.get(year_col, "").strip()
                prv = r.get(prov_col, "").strip()
                tot = sum(_clean_num(r.get(c, "0")) or 0 for c in cols if c in r)
                key = (prv, yr)
                totals[key] = totals.get(key, 0) + tot
        return totals

    hh = agg(DATA_DIR / "doeb_household.csv",   hh_cols)
    tr = agg(DATA_DIR / "doeb_transport.csv",    tr_cols)

    # Sum across provinces, latest year (2560 = 2017)
    hh_total = sum(v for (p, y), v in hh.items() if y == "2560")
    tr_total = sum(v for (p, y), v in tr.items() if y == "2560")

    return {
        "household_total_liters_2560": hh_total,
        "transport_total_liters_2560": tr_total,
        "transport_to_household_ratio": tr_total / hh_total if hh_total else None,
        "source": "Department of Energy Business (DOEB), Ministry of Energy, Thailand",
        "year_note": "BE 2560 = CE 2017",
    }


# ── World Bank income classification ─────────────────────────────────────────

@lru_cache(maxsize=1)
def load_wb_class() -> dict[str, str]:
    """Load World Bank income group classification (Code → Income group)."""
    result = {}
    with open(DATA_DIR / "wb_class.csv") as f:
        for r in csv.DictReader(f):
            result[r["Code"]] = r["Income group"]
    return result
