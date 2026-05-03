from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Literal

from models.statistical import _reform_timeline, score_reform_path

router = APIRouter(prefix="/api/reform-optimize", tags=["reform-optimizer"])

REFORM_PATHS = ["fast_cut", "gradual", "cash_transfer"]


class ReformRequest(BaseModel):
    current_subsidy_pct: float = Field(30.0, ge=0.0, le=100.0)


class ReformResponse(BaseModel):
    paths: dict


@router.get("", response_model=ReformResponse)
def optimize_reform(req: ReformRequest):
    current = req.current_subsidy_pct / 100.0
    paths_out = {}

    for path in REFORM_PATHS:
        timeline = _reform_timeline(current, path)  # type: ignore[arg-type]
        scores = score_reform_path(path, timeline, current)  # type: ignore[arg-type]
        paths_out[path] = {
            "timeline": timeline,
            "scores": scores,
            "label": {
                "fast_cut": "Fast Cut",
                "gradual": "Gradual Phase-Out",
                "cash_transfer": "Cash Transfer Switch",
            }[path],
            "description": {
                "fast_cut": "Full removal in 12 months. Maximum fiscal savings, high short-term disruption.",
                "gradual": "Phase out over 4 years. Smooth transition, slow fiscal recovery.",
                "cash_transfer": "Replace with targeted cash transfers in 24 months. Best equity, moderate cost.",
            }[path],
        }

    return ReformResponse(paths=paths_out)
