from fastapi import APIRouter, HTTPException
from app.services.db import db
from ..models import Bet
from typing import List
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/bets")
async def create_bet(bet: Bet):
    bet_dict = bet.dict()
    bet_dict["_id"] = str(uuid.uuid4())
    await db["bets"].insert_one(bet_dict)
    return {"_id": bet_dict["_id"]}

@router.get("/bets")
async def get_bets():
    cursor = db["bets"].find()
    drivers_data = await db["drivers"].find().to_list(length=None)
    driver_map = {d["_id"]: f"{d['name']} {d['surname']}" for d in drivers_data}

    bets = []
    async for doc in cursor:
        enriched_bet = {
            "_id": str(doc["_id"]),
            "created_at": doc["created_at"],
            "amount": doc["amount"],
            "race_date": doc["race_date"],
            "resolved": doc.get("resolved", False),
            "fastest_lap": driver_map.get(doc["fastest_lap"], doc["fastest_lap"]),
            "predicted_positions": [driver_map.get(d, d) for d in doc["predicted_positions"]],
        }
        bets.append(enriched_bet)

    return bets

@router.get("/bets/{bet_id}", response_model=Bet)
async def get_bet(bet_id: str):
    bet = await db["bets"].find_one({"_id": bet_id})
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")
    bet["_id"] = str(bet["_id"])
    return Bet(**bet)

@router.put("/bets/{bet_id}")
async def update_bet(bet_id: str, updated_bet: Bet):
    updated = await db["bets"].update_one(
        {"_id": bet_id},
        {"$set": updated_bet.dict()}
    )
    if updated.modified_count == 0:
        raise HTTPException(status_code=404, detail="Bet not found or not modified")
    return {"msg": "Bet updated successfully"}

@router.delete("/bets/{bet_id}")
async def delete_bet(bet_id: str):
    result = await db["bets"].delete_one({"_id": bet_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bet not found")
    return {"msg": "Bet deleted successfully"}
