from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Literal
from models.statistical import _reform_timeline, score_reform_path

router = APIRouter(prefix="/api/reform-optimize", tags=["reform-optimizer"])

REFORM_PATHS = ["fast_cut", "gradual", "cash_transfer"]

class ReformResponse(BaseModel):
    paths: dict

@router.get("", response_model=ReformResponse)
def optimize_reform(
    current_subsidy_pct: float = Query(30.0, ge=0.0, le=100.0),
    priority: str = Query("balanced"),
):
    current = current_subsidy_pct / 100.0
    paths_out = {}
    for path in REFORM_PATHS:
        timeline = _reform_timeline(current, path)
        scores = score_reform_path(path, timeline, current)
        paths_out[path] = {
            "timeline": timeline,
            "scores": scores,
            "label": {
                "fast_cut": "Fast Cut",
                "gradual": "Gradual Phase-Out",
                "cash_transfer": "Cash Transfer Switch",
            }[path],
        }
    return ReformResponse(paths=paths_out)
