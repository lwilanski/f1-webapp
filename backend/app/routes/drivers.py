from fastapi import APIRouter
from app.services.db import db

router = APIRouter()

@router.get("/get-drivers")
async def get_drivers():
    cursor = db["drivers"].find()
    drivers = await cursor.to_list(length=None)
    return drivers
