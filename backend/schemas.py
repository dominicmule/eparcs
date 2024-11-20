from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class ZoneBase(BaseModel):
    name: str
    boundaries: Dict[str, Any]  # GeoJSON Polygon
    patrol_frequency: int = 0

class ZoneCreate(ZoneBase):
    pass

class Zone(ZoneBase):
    id: int
    last_patrolled: Optional[datetime] = None

    class Config:
        from_attributes = True

class PatrolBase(BaseModel):
    ranger_id: int
    zone_id: int
    route: Dict[str, Any]  # GeoJSON LineString

class PatrolCreate(PatrolBase):
    pass

class Patrol(PatrolBase):
    id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    incidents: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True