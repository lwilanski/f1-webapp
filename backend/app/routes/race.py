from fastapi import APIRouter, HTTPException
from app.services.f1_api import fetch_from_api
from app.services.db import db

router = APIRouter()

@router.get("/get-latest-race")
async def get_latest_race():
    info = await db["latest_race_info"].find_one({"_id": "latest"})
    cursor = db["latest_race"].find()
    results = await cursor.to_list(length=None)

    drivers_map = {
        d["_id"]: f"{d['name']} {d['surname']}"
        for d in await db["drivers"].find().to_list(length=None)
    }
    teams_map = {
        t["_id"]: t["teamName"]
        for t in await db["teams"].find().to_list(length=None)
    }

    enriched = []
    for r in results:
        enriched.append({
            **r,
            "driverName": drivers_map.get(r["_id"], r["_id"]),
            "teamName": teams_map.get(r["teamId"], r["teamId"])
        })

    return {
        "info": info,
        "results": enriched
    }

@router.get("/get-next-race")
async def get_next_race():
    doc = await db["next_race"].find_one()
    if not doc:
        raise HTTPException(status_code=404, detail="No upcoming race found")
    doc["_id"] = str(doc["_id"])
    return doc

@router.get("/get-race/{year}/{round}")
async def get_race(year: int, round: int):
    url = f"https://f1api.dev/api/{year}/{round}/race"
    return await fetch_from_api(url)
