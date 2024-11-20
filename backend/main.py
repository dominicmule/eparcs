from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ranger Monitoring System API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to Ranger Monitoring System API"}

@app.get("/zones", response_model=List[schemas.Zone])
def get_zones(db: Session = Depends(get_db)):
    zones = db.query(models.Zone).all()
    return zones

@app.get("/patrols", response_model=List[schemas.Patrol])
def get_patrols(db: Session = Depends(get_db)):
    patrols = db.query(models.Patrol).all()
    return patrols

@app.get("/rangers", response_model=List[schemas.User])
def get_rangers(db: Session = Depends(get_db)):
    rangers = db.query(models.User).filter(models.User.role == "ranger").all()
    return rangers