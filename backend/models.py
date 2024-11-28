# app/models.py
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class Coordinates(BaseModel):
    type: str = "Point"
    coordinates: List[float]

class Geometry(BaseModel):
    type: str
    coordinates: List[List[List[float]]]

class IncidentCreate(BaseModel):
    type: str
    coordinates: List[float]
    description: str
    timestamp: datetime

class ZoneCreate(BaseModel):
    name: str
    geometry: Geometry
    description: str
    patrol_frequency: float = Field(ge=0, le=1)

class PatrolRoute(BaseModel):
    ranger_id: str
    coordinates: List[List[float]]
    start_time: datetime
    end_time: Optional[datetime]