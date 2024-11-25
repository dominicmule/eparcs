# scripts/run-backend.py
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=3000,
        reload=True,
        app_dir="app"
    )