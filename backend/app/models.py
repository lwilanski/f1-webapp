from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from zoneinfo import ZoneInfo

class Bet(BaseModel):
    predicted_positions: List[str]
    fastest_lap: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(ZoneInfo("Europe/Warsaw")))
    race_date: datetime
    amount: int
    resolved: bool = False
