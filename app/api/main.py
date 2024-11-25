# app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from . import models

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Missing environment variables. Ensure SUPABASE_URL and SUPABASE_KEY are set in .env"
    )

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Supabase initialization error: {e}")
    raise

@app.post("/incidents")
async def create_incident(incident: models.IncidentCreate):
    try:
        data = supabase.table("incidents").insert({
            "type": incident.type,
            "coordinates": incident.coordinates,
            "description": incident.description,
            "timestamp": incident.timestamp.isoformat()
        }).execute()
        return data.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/zones")
async def create_zone(zone: models.ZoneCreate):
    try:
        data = supabase.table("zones").insert({
            "name": zone.name,
            "geometry": zone.geometry.dict(),
            "description": zone.description,
            "patrol_frequency": zone.patrol_frequency
        }).execute()
        return data.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/patrols")
async def get_patrols():
    try:
        response = supabase.table("patrol_routes").select("*").execute()
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": route["coordinates"]
                    },
                    "properties": {
                        "rangerId": route["ranger_id"],
                        "startTime": route["start_time"],
                        "endTime": route["end_time"]
                    }
                }
                for route in response.data
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}