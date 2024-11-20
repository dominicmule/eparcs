from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)
    is_active = Column(Boolean, default=True)

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    boundaries = Column(JSON)  # GeoJSON Polygon
    patrol_frequency = Column(Integer, default=0)
    last_patrolled = Column(DateTime, nullable=True)

class Patrol(Base):
    __tablename__ = "patrols"

    id = Column(Integer, primary_key=True, index=True)
    ranger_id = Column(Integer, ForeignKey("users.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    route = Column(JSON)  # GeoJSON LineString
    incidents = Column(JSON, nullable=True)  # Array of incident objects

    ranger = relationship("User", back_populates="patrols")
    zone = relationship("Zone", back_populates="patrols")

User.patrols = relationship("Patrol", back_populates="ranger")
Zone.patrols = relationship("Patrol", back_populates="zone")