from fastapi import APIRouter
from app.services.db import db

router = APIRouter()

@router.get("/get-latest-qualy")
async def get_latest_qualy():
    info = await db["latest_qualy_info"].find_one({"_id": "latest"}) or {}

    qualy_results = await db["latest_qualy"].find().to_list(length=None)
    drivers = await db["drivers"].find().to_list(length=None)
    teams = await db["teams"].find().to_list(length=None)

    driver_map = {d["_id"]: d for d in drivers}
    team_map = {t["_id"]: t for t in teams}

    enriched_results = []
    for r in qualy_results:
        driver = driver_map.get(r["driverId"])
        team = team_map.get(r["teamId"])

        enriched_results.append({
            **r,
            "driverName": f"{driver['name']} {driver['surname']}" if driver else "Unknown",
            "teamName": team["teamName"] if team else "Unknown"
        })

    return {
        "info": info,
        "results": enriched_results
    }
