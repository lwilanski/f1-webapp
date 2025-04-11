from fastapi import APIRouter
from app.services.db import db

router = APIRouter()

@router.get("/get-teams")
async def get_teams():
    cursor = db["teams"].find()
    teams = await cursor.to_list(length=None)
    return teams
